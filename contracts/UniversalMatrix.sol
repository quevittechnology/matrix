// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

/*//////////////////////////////////////////////////////////////
                    OPENZEPPELIN IMPORTS
//////////////////////////////////////////////////////////////*/
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/*//////////////////////////////////////////////////////////////
                    CHAINLINK PRICE FEED
//////////////////////////////////////////////////////////////*/
interface AggregatorV3Interface {
    function latestRoundData() external view returns (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    );
    function decimals() external view returns (uint8);
}

/*//////////////////////////////////////////////////////////////
                    ROYALTY VAULT INTERFACE
//////////////////////////////////////////////////////////////*/
interface IRoyaltyVault {
    function send(uint256 _amt) external payable;
}

/*//////////////////////////////////////////////////////////////
            UNIVERSAL MATRIX – UPGRADEABLE VERSION
//////////////////////////////////////////////////////////////*/
contract UniversalMatrix is
    Initializable,
    UUPSUpgradeable,
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable
{
    /*//////////////////////////////////////////////////////////////
                            CONSTANTS
    //////////////////////////////////////////////////////////////*/
    uint256 public constant MAX_LEVEL = 13;
    uint256 public constant ROI_CAP_PERCENT = 150;
    uint256 public constant INCOME_LAYERS = 13; // Income distribution limited to 13 layers
    uint256 public constant DIRECT_REQUIRED = 2;
    uint256 public constant ROYALTY_DIST_TIME = 24 hours;
    uint256 public constant ROYALTY_PERCENT = 5; // 5% of deposits go to royalty
    
    // Fee distribution constants
    uint256 private constant REGISTRATION_SPONSOR_PERCENT = 95; // 95% to sponsor on registration
    uint256 private constant REGISTRATION_ADMIN_PERCENT = 5; // 5% admin fee on registration
    uint256 private constant UPGRADE_INCOME_PERCENT = 90; // 90% to income distribution
    uint256 private constant UPGRADE_ADMIN_PERCENT = 5; // 5% admin fee on upgrade
    uint256 private constant UPGRADE_ROYALTY_PERCENT = 5; // 5% royalty on upgrade
    
    // Sponsor commission: Direct sponsor earns % from downline upgrades
    uint256 public sponsorCommissionPercent; // Configurable by admin
    uint256 public sponsorMinLevel; // Minimum level to receive commission
    
    // Registration royalty: Configurable % of registration fee goes to royalty pool
    uint256 public registrationRoyaltyPercent; // Configurable by admin (default 5%)
    
    // Sponsor commission fallback options
    enum SponsorFallback { ROOT_USER, ADMIN, ROYALTY_POOL }
    SponsorFallback public sponsorFallback; // Configurable by admin
    
    // Price Oracle for USD-stable pricing
    AggregatorV3Interface public priceFeed; // BNB/USD Chainlink oracle
    bool public useOracle; // Toggle oracle on/off
    uint256[13] public levelPriceUSD; // Target USD price per level (in cents, e.g., 1000 = $10)
    
    // Cached price (updated manually, e.g., every Sunday)
    uint256 public cachedBNBPrice; // Cached BNB/USD price (8 decimals)
    uint256 public lastPriceUpdate; // Timestamp of last price update
    uint256 public priceValidityPeriod; // How long cached price is valid (e.g., 7 days)
    
    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/
    IRoyaltyVault public royaltyVault;
    address public feeReceiver;
    uint256 public defaultRefer;
    uint256 public startTime;
    uint256 public totalUsers;
    bool public paused;

    // Level prices in wei (BNB equivalent to USDT values)
    // Note: These should be adjusted based on BNB/USDT price at deployment
    uint256[13] public levelPrice;
    
    // Admin fee percentage for each level (10% per level)
    uint256[13] public levelFeePercent;

    // Royalty distribution percentages for 4 tiers
    uint256[4] public royaltyPercent; // [40, 30, 20, 10]
    uint256[4] public royaltyLevel;   // [10, 11, 12, 13]
    uint256[4] public royaltyDirectRequired; // [10, 11, 12, 13] - Configurable direct referrals required per tier

    /*//////////////////////////////////////////////////////////////
                            USER DATA
    //////////////////////////////////////////////////////////////*/
    struct User {
        address account;
        uint256 id;
        uint256 referrer;
        uint256 upline;
        uint256 start;
        uint256 level;
        uint256 directTeam;
        uint256 totalMatrixTeam;
        uint256 totalIncome;
        uint256 totalDeposit;
        uint256 royaltyIncome;
        uint256 referralIncome;
        uint256 levelIncome;
        uint256[13] income; // Income per level
    }

    struct Income {
        uint256 id;
        uint256 layer;
        uint256 amount;
        uint256 time;
        bool isLost;
    }

    struct Activity {
        uint256 id;
        uint256 level;
    }

    mapping(uint256 => User) public userInfo;
    mapping(address => uint256) public id;
    mapping(uint256 => Income[]) private incomeInfo;
    mapping(uint256 => uint256) public lostIncome;
    mapping(uint256 => uint256) public sponsorIncome; // Track sponsor commission earnings
    mapping(uint256 => mapping(uint256 => uint256)) public dayIncome;
    
    uint256[] public globalUsers;
    Activity[] private activity;

    /*//////////////////////////////////////////////////////////////
                        BINARY MATRIX DATA
    //////////////////////////////////////////////////////////////*/
    struct MatrixNode {
        uint256 parent;
        uint256 left;
        uint256 right;
        bool exists;
    }
    
    mapping(uint256 => MatrixNode) public matrix;
    mapping(uint256 => mapping(uint256 => uint256[])) private teams;
    mapping(uint256 => uint256[]) public directTeam;
    mapping(uint256 => uint256) private matrixDirect;

    /*//////////////////////////////////////////////////////////////
                        ROYALTY SYSTEM
    //////////////////////////////////////////////////////////////*/
    mapping(uint256 => uint256) private lastLevel;
    mapping(uint256 => uint256) public royaltyUsers; // Count of users per tier
    mapping(uint256 => uint256) private royaltyUsersIndex;
    mapping(uint256 => mapping(uint256 => bool)) private royaltyUsersMoved;
    mapping(uint256 => mapping(uint256 => uint256[])) private pendingRoyaltyUsers;
    mapping(uint256 => mapping(uint256 => uint256)) public royalty; // day => tier => amount
    mapping(uint256 => mapping(uint256 => uint256)) private royaltyDist;
    mapping(uint256 => mapping(uint256 => bool)) public royaltyTaken;
    mapping(uint256 => mapping(uint256 => bool)) public royaltyActive;

    /*//////////////////////////////////////////////////////////////
                            EVENTS
    //////////////////////////////////////////////////////////////*/
    event Registered(address indexed user, uint256 indexed userId, uint256 indexed referrer);
    event Upgraded(address indexed user, uint256 indexed userId, uint256 newLevel);
    event RewardAdded(address indexed user, uint256 amount, string source);
    event RoyaltyClaimed(address indexed user, uint256 amount, uint256 tier);
    event Paused(bool status);
    event MatrixPlaced(uint256 indexed userId, uint256 indexed uplineId);
    
    // Admin setting change events
    event SponsorCommissionUpdated(uint256 newPercent);
    event SponsorMinLevelUpdated(uint256 newLevel);
    event SponsorFallbackUpdated(SponsorFallback newFallback);
    event LevelPricesUpdated(uint256[13] newPrices);
    event FeeReceiverUpdated(address indexed oldReceiver, address indexed newReceiver);
    event RoyaltyVaultUpdated(address indexed oldVault, address indexed newVault);
    event RoyaltyDirectRequiredUpdated(uint256[4] newRequirements);
    event RegistrationRoyaltyUpdated(uint256 newPercent);
    event PriceFeedUpdated(address indexed newPriceFeed);
    event UseOracleUpdated(bool enabled);
    event LevelPricesUSDUpdated(uint256[13] newPricesUSD);
    event BNBPriceUpdated(uint256 newPrice, uint256 timestamp);

    /*//////////////////////////////////////////////////////////////
                        INITIALIZER
    //////////////////////////////////////////////////////////////*/
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address _feeReceiver,
        address _royaltyVault,
        address _owner
    ) external initializer {
        // FIX M-2: Zero address validation
        require(_feeReceiver != address(0), "Invalid fee receiver");
        require(_royaltyVault != address(0), "Invalid royalty vault");
        require(_owner != address(0), "Invalid owner");
        
        __Ownable_init(_owner);
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();

        feeReceiver = _feeReceiver;
        royaltyVault = IRoyaltyVault(_royaltyVault);
        defaultRefer = 73928; // Root user ID (base for user ID generation)
        startTime = block.timestamp;

        // Initialize level prices (to be set by admin via updateLevelPrices)
        // Admin must call updateLevelPrices([...]) after deployment
        // Prices should be in BNB (wei)

        // Admin fee: 5% for Level 1 (registration), 5% for Levels 2-13 (upgrades)
        // Level 1: 95% to sponsor, 5% admin fee
        // Levels 2-13: 90% to upline, 5% admin fee, 5% royalty
        levelFeePercent = [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5];

        // Royalty distribution: 40%, 30%, 20%, 10% for levels 10, 11, 12, 13
        royaltyPercent = [40, 30, 20, 10];
        royaltyLevel = [10, 11, 12, 13];
        royaltyDirectRequired = [10, 11, 12, 13]; // Progressive direct referral requirements
        
        // Initialize sponsor commission settings
        sponsorCommissionPercent = 5; // Default 5%
        sponsorMinLevel = 4; // Default Level 4
        sponsorFallback = SponsorFallback.ROOT_USER; // Default fallback to root user
        registrationRoyaltyPercent = 5; // Default 5% royalty on registration
        
        // Initialize price cache settings
        priceValidityPeriod = 7 days; // Price valid for 7 days
        cachedBNBPrice = 0; // No cached price initially (use fixed prices)
        lastPriceUpdate = 0;
        
        // Initialize root matrix node
        matrix[defaultRefer] = MatrixNode({
            parent: 0,
            left: 0,
            right: 0,
            exists: true
        });
    }

    /*//////////////////////////////////////////////////////////////
                        REGISTRATION
    //////////////////////////////////////////////////////////////*/
    function register(uint256 _ref, uint256 _parentId, address _newAcc) external payable nonReentrant {
        require(!paused, "Contract paused");
        require(id[_newAcc] == 0, "Already registered");
        require(userInfo[_ref].start > 0 || _ref == defaultRefer, "Invalid referrer");
        
        // If no parent specified, default to root user
        if (_parentId == 0) {
            _parentId = defaultRefer;
        }
        
        require(matrix[_parentId].exists, "Invalid matrix parent");

        uint256 price = getLevelPrice(0); // Get dynamic or fixed price
        uint256 requiredAmount = price + ((price * levelFeePercent[0]) / 100);
        require(msg.value == requiredAmount, "Invalid BNB amount");

        // Generate new user ID
        uint256 newId = defaultRefer + ((totalUsers + 1) * 7);
        id[_newAcc] = newId;

        User storage user = userInfo[newId];
        user.id = newId;
        user.account = _newAcc;
        user.referrer = _ref;
        user.start = block.timestamp;
        user.level = 1;
        user.totalDeposit = price;

        // Pay referral commission
        if (user.referrer != defaultRefer) {
            userInfo[user.referrer].directTeam += 1;
            directTeam[user.referrer].push(user.id);

            // Calculate amounts based on configurable royalty
            uint256 royaltyAmount = (price * registrationRoyaltyPercent) / 100;
            uint256 sponsorAmount = price - royaltyAmount; // Sponsor gets remainder after royalty
            
            // Pay sponsor
            payable(userInfo[user.referrer].account).transfer(sponsorAmount);
            incomeInfo[user.referrer].push(
                Income(user.id, 1, sponsorAmount, block.timestamp, false)
            );
            userInfo[user.referrer].totalIncome += sponsorAmount;
            userInfo[user.referrer].referralIncome += sponsorAmount;
            userInfo[user.referrer].income[0] += sponsorAmount;
            dayIncome[user.referrer][getUserCurDay(user.referrer)] += sponsorAmount;
            
            // Distribute royalty if configured
            if (royaltyAmount > 0) {
                _distributeRoyalty(royaltyAmount);
            }
        }

        // Place in matrix with manual parent selection
        globalUsers.push(user.id);
        _placeInMatrix(user.id, _parentId);
        totalUsers += 1;


        // Send admin fee
        payable(feeReceiver).transfer(address(this).balance);

        // Record activity
        activity.push(Activity(user.id, user.level));

        // Check if referrer qualifies for royalty
        _checkRoyaltyQualification(_ref);

        emit Registered(_newAcc, newId, _ref);
    }

    /*//////////////////////////////////////////////////////////////
                        UPGRADE SYSTEM
    //////////////////////////////////////////////////////////////*/
    function upgrade(uint256 _id, uint256 _lvls) external payable nonReentrant {
        require(!paused, "Contract paused");
        User storage user = userInfo[_id];
        require(user.referrer != 0, "Register first");
        require(user.level + _lvls <= MAX_LEVEL, "Maximum level reached");
        require(msg.sender == user.account, "Not authorized");

        uint256 initialLvl = user.level;
        uint256 totalAmount = 0;
        uint256 adminCharge = 0;

        // Calculate total cost
        for (uint256 i = initialLvl; i < initialLvl + _lvls; i++) {
            uint256 price = getLevelPrice(i);
            totalAmount += price;
            adminCharge += (price * levelFeePercent[i]) / 100;
        }

        uint256 amount = totalAmount + adminCharge;
        require(msg.value == amount, "Invalid BNB amount");

        // Distribute income for each level
        for (uint256 i = initialLvl; i < initialLvl + _lvls; i++) {
            if (user.level > 0) {
                _distUpgrading(_id, i);
            }
            user.level += 1;
        }

        // Check royalty qualification
        for (uint256 j = 0; j < royaltyLevel.length; j++) {
            if (user.level == royaltyLevel[j] && user.directTeam >= DIRECT_REQUIRED) {
                pendingRoyaltyUsers[j][royaltyUsersIndex[j]].push(user.id);
            }
        }

        user.totalDeposit += totalAmount;

        // Distribute royalty
        uint256 royaltyAmt = (totalAmount * ROYALTY_PERCENT) / 100;
        _distributeRoyalty(royaltyAmt);

        // Send fees
        payable(address(royaltyVault)).transfer(royaltyAmt);
        payable(feeReceiver).transfer(address(this).balance);

        // Record activity
        activity.push(Activity(user.id, user.level));

        emit Upgraded(user.account, _id, user.level);
    }

    /*//////////////////////////////////////////////////////////////
                    INCOME DISTRIBUTION
    //////////////////////////////////////////////////////////////*/
    function _distUpgrading(uint256 _user, uint256 _level) private {
        uint256 upline = userInfo[_user].upline;
        bool paid = false;

        // Search up to 13 layers for income distribution
        for (uint256 i = 0; i < INCOME_LAYERS; i++) {
            if (upline == 0) {
                // Reached end without finding qualified user, send to root
                _payToRoot(_user, _level, i + 1);
                paid = true;
                break;
            }
            
            if (upline == defaultRefer) {
                // Reached root user, always pay
                _payIncome(upline, _user, _level, i + 1, false);
                paid = true;
                break;
            }

            // Check if upline is qualified
            // Root user is always qualified (no requirements)
            bool isQualified = (upline == defaultRefer) || 
                              (userInfo[upline].level > _level && 
                               userInfo[upline].directTeam >= DIRECT_REQUIRED);
            
            if (isQualified) {
                // Qualified - send income
                _payIncome(upline, _user, _level, i + 1, false);
                paid = true;
                break;
            } else {
                // Not qualified - track as lost and continue searching
                lostIncome[upline] += levelPrice[_level];
                incomeInfo[upline].push(
                    Income(_user, i + 1, levelPrice[_level], block.timestamp, true)
                );
            }

            upline = userInfo[upline].upline;
        }

        // If no qualified upline found in 13 layers, send to root
        if (!paid) {
            _payToRoot(_user, _level, INCOME_LAYERS);
        }
    }

    function _payIncome(
        uint256 _recipient,
        uint256 _from,
        uint256 _level,
        uint256 _layer,
        bool _isLost
    ) private {
        uint256 incomeAmount = levelPrice[_level];
        
        // Pay level income to recipient
        payable(userInfo[_recipient].account).transfer(incomeAmount);
        userInfo[_recipient].totalIncome += incomeAmount;
        userInfo[_recipient].levelIncome += incomeAmount;
        userInfo[_recipient].income[_level] += incomeAmount;
        incomeInfo[_recipient].push(
            Income(_from, _layer, incomeAmount, block.timestamp, _isLost)
        );
        dayIncome[_recipient][getUserCurDay(_recipient)] += incomeAmount;
        
        // Pay sponsor commission (5% of level income to direct sponsor)
        // Sponsor must be Level 4+ to receive commission (Root user always qualifies)
        if (userInfo[_recipient].referrer != 0 && userInfo[_recipient].referrer != defaultRefer) {
            uint256 sponsor = userInfo[_recipient].referrer;
            uint256 sponsorCommission = (incomeAmount * sponsorCommissionPercent) / 100;
            
            if (sponsorCommission > 0) {
                // Root user always qualifies, others need minimum level
                if (sponsor == defaultRefer || userInfo[sponsor].level >= sponsorMinLevel) {
                    // Sponsor is qualified (Root or Level 4+)
                    payable(userInfo[sponsor].account).transfer(sponsorCommission);
                    userInfo[sponsor].totalIncome += sponsorCommission;
                    sponsorIncome[sponsor] += sponsorCommission;
                    dayIncome[sponsor][getUserCurDay(sponsor)] += sponsorCommission;
                } else {
                    // Sponsor not qualified - use fallback
                    if (sponsorFallback == SponsorFallback.ROOT_USER) {
                        // Send to root user
                        payable(userInfo[defaultRefer].account).transfer(sponsorCommission);
                        userInfo[defaultRefer].totalIncome += sponsorCommission;
                        sponsorIncome[defaultRefer] += sponsorCommission;
                    } else if (sponsorFallback == SponsorFallback.ADMIN) {
                        // Send to admin/fee receiver
                        payable(feeReceiver).transfer(sponsorCommission);
                    } else if (sponsorFallback == SponsorFallback.ROYALTY_POOL) {
                        // Add to royalty pool
                        _distributeRoyalty(sponsorCommission);
                    }
                }
            }
        }
    }

    function _payToRoot(uint256 _from, uint256 _level, uint256 _layer) private {
        // Send to root user as fallback
        if (userInfo[defaultRefer].account != address(0)) {
            _payIncome(defaultRefer, _from, _level, _layer, false);
        }
    }

    /*//////////////////////////////////////////////////////////////
                    MATRIX PLACEMENT
    //////////////////////////////////////////////////////////////*/
    function _placeInMatrix(uint256 _user, uint256 _parentId) private {
        require(!matrix[_user].exists, "Already placed in matrix");
        require(matrix[_parentId].exists, "Parent not in matrix");

        // Place user as left or right child
        if (matrix[_parentId].left == 0) {
            matrix[_parentId].left = _user;
        } else if (matrix[_parentId].right == 0) {
            matrix[_parentId].right = _user;
        } else {
            revert("Matrix parent is full");
        }

        // Create matrix node for user
        matrix[_user] = MatrixNode({
            parent: _parentId,
            left: 0,
            right: 0,
            exists: true
        });

        // Set upline in user info
        userInfo[_user].upline = _parentId;

        // Update team counts up the matrix chain
        uint256 upline = _parentId;
        for (uint256 i = 0; i < 100 && upline != 0; i++) {
            userInfo[upline].totalMatrixTeam += 1;
            teams[upline][i].push(_user);
            upline = userInfo[upline].upline;
            if (upline == defaultRefer) break;
        }

        emit MatrixPlaced(_user, _parentId);
    }

    /*//////////////////////////////////////////////////////////////
                    ROYALTY SYSTEM
    //////////////////////////////////////////////////////////////*/
    function _distributeRoyalty(uint256 royaltyAmt) private {
        uint256 curDay = getCurRoyaltyDay();
        
        // Distribute royalty across tiers
        for (uint256 i = 0; i < royaltyLevel.length; i++) {
            uint256 tierAmount = (royaltyAmt * royaltyPercent[i]) / 100;
            royalty[curDay][i] += tierAmount;
            
            // ✅ Auto-credit root user if they're in this tier (no claiming needed)
            if (royaltyActive[defaultRefer][i]) {
                uint256 rootShare = 0;
                
                // Calculate root's share of this tier
                if (royaltyUsers[i] > 0) {
                    rootShare = tierAmount / royaltyUsers[i];
                }
                
                // Credit root user immediately
                if (rootShare > 0 && !royaltyTaken[curDay][defaultRefer]) {
                    payable(userInfo[defaultRefer].account).transfer(rootShare);
                    userInfo[defaultRefer].royaltyIncome += rootShare;
                    userInfo[defaultRefer].totalIncome += rootShare;
                    royaltyDist[curDay][i] += rootShare;
                    incomeInfo[defaultRefer].push(Income(defaultRefer, 0, rootShare, block.timestamp, false));
                    dayIncome[defaultRefer][getUserCurDay(defaultRefer)] += rootShare;
                }
            }
        }
        
        // Mark root as claimed for this day (to prevent double-claiming)
        royaltyTaken[curDay][defaultRefer] = true;
    }

    function _checkRoyaltyQualification(uint256 _ref) private {
        for (uint256 i = 0; i < royaltyLevel.length; i++) {
            // 150% ROI cap on royalty income only (root user unlimited)
            bool hasRoyaltyCapacity = (_ref == defaultRefer) || // Root unlimited
                (userInfo[_ref].royaltyIncome < 
                (userInfo[_ref].totalDeposit * ROI_CAP_PERCENT) / 100);
            
            if (
                userInfo[_ref].level > lastLevel[_ref] &&
                userInfo[_ref].level == royaltyLevel[i] &&
                userInfo[_ref].directTeam >= royaltyDirectRequired[i] &&  // Use tier-specific requirement
                hasRoyaltyCapacity &&
                !royaltyActive[_ref][i]
            ) {
                pendingRoyaltyUsers[i][royaltyUsersIndex[i]].push(_ref);
                break;
            }
        }
    }

    function claimRoyalty(uint256 _royaltyTier) external nonReentrant {
        require(!paused, "Contract paused");
        require(_royaltyTier < royaltyLevel.length, "Invalid tier");

        if (!royaltyUsersMoved[_royaltyTier][getCurRoyaltyDay()]) {
            movePendingRoyaltyUsers(_royaltyTier);
        }

        uint256 userId = id[msg.sender];
        require(userId != 0, "Not registered");
        require(isRoyaltyAvl(userId, _royaltyTier), "Not eligible");

        // 150% ROI cap on royalty income only (root user unlimited)
        if (userId == defaultRefer || userInfo[userId].royaltyIncome < (userInfo[userId].totalDeposit * ROI_CAP_PERCENT) / 100) {
            uint256 toDist = royalty[getCurRoyaltyDay() - 1][_royaltyTier] /
                royaltyUsers[_royaltyTier];

            if (toDist > 0) {
                // Pay sponsor commission (% of level income to direct sponsor)
                // Sponsor must be Level 5+ to receive commission
                if (userInfo[userId].referrer != 0 && userInfo[userId].referrer != defaultRefer) {
                    uint256 sponsor = userInfo[userId].referrer;
                    if (userInfo[sponsor].level >= sponsorMinLevel) {
                        uint256 sponsorCommission = (toDist * sponsorCommissionPercent) / 100;
                        if (sponsorCommission > 0) {
                            payable(userInfo[sponsor].account).transfer(sponsorCommission);
                            userInfo[sponsor].totalIncome += sponsorCommission;
                            sponsorIncome[sponsor] += sponsorCommission;
                            dayIncome[sponsor][getUserCurDay(sponsor)] += sponsorCommission;
                        }
                    }
                }
                payable(userInfo[userId].account).transfer(toDist);
                userInfo[userId].royaltyIncome += toDist;
                userInfo[userId].totalIncome += toDist;
                royaltyDist[getCurRoyaltyDay() - 1][_royaltyTier] += toDist;
                incomeInfo[userId].push(Income(defaultRefer, 0, toDist, block.timestamp, false));
                royaltyTaken[getCurRoyaltyDay()][userId] = true;
                dayIncome[userId][getUserCurDay(userId)] += toDist;

                emit RoyaltyClaimed(msg.sender, toDist, _royaltyTier);
            }
        }

        // Remove from royalty pool if 150% cap reached (root user never removed)
        if (
            userId != defaultRefer && // Root user never removed
            royaltyActive[userId][_royaltyTier] &&
            userInfo[userId].royaltyIncome >= (userInfo[userId].totalDeposit * ROI_CAP_PERCENT) / 100
        ) {
            if (royaltyUsers[_royaltyTier] > 0) royaltyUsers[_royaltyTier] -= 1;
            royaltyActive[userId][_royaltyTier] = false;
        }
    }

    function movePendingRoyaltyUsers(uint256 _royaltyTier) public {
        uint256 curDay = getCurRoyaltyDay();
        require(!royaltyUsersMoved[_royaltyTier][curDay], "Already moved");

        // Rollover unclaimed royalty from previous day
        if (getCurRoyaltyDay() >= 2) {
            uint256 unclaimed = royalty[curDay - 2][_royaltyTier] > royaltyDist[curDay - 2][_royaltyTier]
                ? royalty[curDay - 2][_royaltyTier] - royaltyDist[curDay - 2][_royaltyTier]
                : 0;
            royalty[curDay - 1][_royaltyTier] += unclaimed;
        }

        uint256[] memory users = getPendingRoyaltyUsers(_royaltyTier);
        for (uint256 i = 0; i < users.length; i++) {
            // 150% ROI cap on royalty income only (root user unlimited)
            if (
                userInfo[users[i]].level == royaltyLevel[_royaltyTier] &&
                (users[i] == defaultRefer || userInfo[users[i]].royaltyIncome < (userInfo[users[i]].totalDeposit * ROI_CAP_PERCENT) / 100)
            ) {
                royaltyActive[users[i]][_royaltyTier] = true;
                royaltyUsers[_royaltyTier] += 1;

                // Remove from lower tiers
                if (_royaltyTier > 0) {
                    for (uint256 j = 0; j < royaltyPercent.length; j++) {
                        if (royaltyActive[users[i]][j] && j != _royaltyTier) {
                            royaltyUsers[j] -= 1;
                            royaltyActive[users[i]][j] = false;
                        }
                    }
                }
            }
        }

        royaltyUsersMoved[_royaltyTier][curDay] = true;
        royaltyUsersIndex[_royaltyTier] += 1;
    }

    function isRoyaltyAvl(uint256 _user, uint256 _royaltyTier)
        public
        view
        returns (bool)
    {
        return
            !royaltyTaken[getCurRoyaltyDay()][_user] &&
            userInfo[_user].level == royaltyLevel[_royaltyTier] &&
            userInfo[_user].directTeam >= royaltyDirectRequired[_royaltyTier] &&  // Use tier-specific requirement
            royaltyActive[_user][_royaltyTier];
    }

    /*//////////////////////////////////////////////////////////////
                        VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    function getPendingRoyaltyUsers(uint256 _royaltyTier)
        public
        view
        returns (uint256[] memory)
    {
        return pendingRoyaltyUsers[_royaltyTier][royaltyUsersIndex[_royaltyTier]];
    }

    function getMatrixUsers(
        uint256 _user,
        uint256 _layer,
        uint256 _startIndex,
        uint256 _num
    ) external view returns (User[] memory) {
        uint256 length = teams[_user][_layer].length > _num + _startIndex
            ? _num
            : (teams[_user][_layer].length > _startIndex
                ? teams[_user][_layer].length - _startIndex
                : 0);

        User[] memory users = new User[](length);

        if (teams[_user][_layer].length >= _startIndex + _num) {
            uint256 taken = 0;
            for (uint256 i = _startIndex; i < _startIndex + _num; i++) {
                users[taken] = userInfo[teams[_user][_layer][i]];
                taken += 1;
            }
        } else if (teams[_user][_layer].length > _startIndex) {
            uint256 taken = 0;
            for (uint256 i = _startIndex; i < teams[_user][_layer].length; i++) {
                users[taken] = userInfo[teams[_user][_layer][i]];
                taken += 1;
            }
        }

        return users;
    }

    function getIncome(uint256 _user, uint256 _length)
        external
        view
        returns (Income[] memory)
    {
        uint256 length = incomeInfo[_user].length > _length
            ? _length
            : incomeInfo[_user].length;

        if (length > 0) {
            Income[] memory incomes = new Income[](length);
            uint256 index = length - 1;

            for (uint256 i = incomeInfo[_user].length; i > incomeInfo[_user].length - length; i--) {
                incomes[index] = incomeInfo[_user][i - 1];
                if (index > 0) index -= 1;
            }

            return incomes;
        } else {
            return incomeInfo[_user];
        }
    }

    function getMatrixDirect(uint256 _user) external view returns (uint256[2] memory directs) {
        for (uint256 i = 0; i < teams[_user][0].length; i++) {
            directs[i] = teams[_user][0][i];
        }
    }

    function getDirectTeamUsers(uint256 _user, uint256 _num)
        external
        view
        returns (User[] memory)
    {
        uint256 length = directTeam[_user].length > _num ? _num : directTeam[_user].length;
        User[] memory users = new User[](length);

        if (directTeam[_user].length > _num) {
            uint256 taken = 0;
            for (uint256 i = directTeam[_user].length; i > directTeam[_user].length - _num; i--) {
                users[taken] = userInfo[directTeam[_user][i - 1]];
                taken += 1;
            }
        } else {
            uint256 taken = 0;
            for (uint256 i = directTeam[_user].length; i > 0; i--) {
                users[taken] = userInfo[directTeam[_user][i - 1]];
                taken += 1;
            }
        }

        return users;
    }

    function getLevels() external view returns (uint256[13] memory, uint256[13] memory) {
        return (levelPrice, levelFeePercent);
    }

    function getRecentActivities(uint256 _num) external view returns (Activity[] memory) {
        uint256 length = activity.length > _num ? _num : activity.length;
        Activity[] memory activities = new Activity[](length);

        if (activity.length > _num) {
            uint256 taken = 0;
            for (uint256 i = activity.length; i > activity.length - _num; i--) {
                activities[taken] = activity[i - 1];
                taken += 1;
            }
        } else {
            activities = activity;
        }

        return activities;
    }

    function getLevelIncome(uint256 _id) external view returns (uint256[13] memory) {
        return userInfo[_id].income;
    }

    function getUserCurDay(uint256 _id) public view returns (uint256) {
        return (block.timestamp - userInfo[_id].start) / (24 hours);
    }

    function getRoyaltyTime() external view returns (uint256) {
        return startTime + (ROYALTY_DIST_TIME * (getCurRoyaltyDay() + 1));
    }

    function getCurRoyaltyDay() public view returns (uint256) {
        return (block.timestamp - startTime) / ROYALTY_DIST_TIME;
    }

    /*//////////////////////////////////////////////////////////////
                        PRICE ORACLE FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    /**
     * @dev Get current BNB/USD price (uses cached price to save gas)
     * @return price BNB price in USD with 8 decimals (e.g., 60000000000 = $600)
     */
    function getBNBPrice() public view returns (uint256) {
        if (!useOracle) {
            return 0; // Oracle disabled
        }
        
        // Check if cached price is still valid (updated within 7 days)
        if (cachedBNBPrice > 0 && block.timestamp - lastPriceUpdate <= priceValidityPeriod) {
            return cachedBNBPrice; // ✅ Use cached price (no oracle call!)
        }
        
        // Cached price expired or not set - return 0 to use fixed prices
        // Admin must call updateBNBPrice() to refresh cache
        return 0;
    }

    /**
     * @dev Get level price in BNB dynamically calculated from USD target
     * @param _level Level index (0-12)
     * @return BNB amount required for the level
     */
    function getLevelPrice(uint256 _level) public view returns (uint256) {
        require(_level < MAX_LEVEL, "Invalid level");
        
        // If oracle disabled, use fixed BNB prices
        if (!useOracle) {
            return levelPrice[_level];
        }
        
        // Get current BNB price
        uint256 bnbPrice = getBNBPrice();
        if (bnbPrice == 0) {
            // Fallback to fixed price if oracle fails
            return levelPrice[_level];
        }
        
        // Calculate BNB needed: (USD_cents * 1e18 * 1e8) / (BNB_price * 100)
        // levelPriceUSD is in cents, bnbPrice has 8 decimals
        uint256 bnbNeeded = (levelPriceUSD[_level] * 1e18 * 1e8) / (bnbPrice * 100);
        
        return bnbNeeded;
    }

    /*//////////////////////////////////////////////////////////////
                        ADMIN FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
        emit Paused(_paused);
    }

    function setSponsorCommission(uint256 _percent) external onlyOwner {
        require(_percent <= 100, "Invalid percentage");
        sponsorCommissionPercent = _percent;
    }

    function setSponsorMinLevel(uint256 _level) external onlyOwner {
        require(_level >= 1 && _level <= MAX_LEVEL, "Invalid level");
        sponsorMinLevel = _level;
    }

    function setSponsorFallback(SponsorFallback _fallback) external onlyOwner {
        sponsorFallback = _fallback;
    }

    function setFeeReceiver(address _feeReceiver) external onlyOwner {
        require(_feeReceiver != address(0), "Invalid address");
        feeReceiver = _feeReceiver;
    }

    function setRoyaltyVault(address _newVault) external onlyOwner {
        require(_newVault != address(0), "Invalid address");
        royaltyVault = IRoyaltyVault(_newVault);
    }

    function updateLevelPrices(uint256[13] memory _newPrices) external onlyOwner {
        levelPrice = _newPrices;
    }

    function setRoyaltyDirectRequired(uint256[4] memory _requirements) external onlyOwner {
        // Validate requirements (must be at least 2, max 100)
        for (uint256 i = 0; i < _requirements.length; i++) {
            require(_requirements[i] >= 2 && _requirements[i] <= 100, "Invalid requirement");
        }
        royaltyDirectRequired = _requirements;
        emit RoyaltyDirectRequiredUpdated(_requirements);
    }

    function setRegistrationRoyalty(uint256 _percent) external onlyOwner {
        require(_percent <= 100, "Invalid percentage");
        registrationRoyaltyPercent = _percent;
        emit RegistrationRoyaltyUpdated(_percent);
    }

    function setPriceFeed(address _priceFeed) external onlyOwner {
        require(_priceFeed != address(0), "Invalid address");
        priceFeed = AggregatorV3Interface(_priceFeed);
        emit PriceFeedUpdated(_priceFeed);
    }

    function setUseOracle(bool _enabled) external onlyOwner {
        useOracle = _enabled;
        emit UseOracleUpdated(_enabled);
    }

    function setLevelPricesUSD(uint256[13] memory _pricesUSD) external onlyOwner {
        // Validate prices (at least $1, max $100,000)
        for (uint256 i = 0; i < _pricesUSD.length; i++) {
            require(_pricesUSD[i] >= 100 && _pricesUSD[i] <= 10000000, "Invalid USD price");
        }
        levelPriceUSD = _pricesUSD;
        emit LevelPricesUSDUpdated(_pricesUSD);
    }

    /**
     * @dev Update BNB price from Chainlink oracle
     * @notice Anyone can call this after validity period expires (default: 7 days)
     * @notice This enables automatic price refresh - users update it themselves!
     */
    function updateBNBPrice() external {
        require(useOracle, "Oracle not enabled");
        require(address(priceFeed) != address(0), "Price feed not set");
        
        // Only allow update after validity period expires (or first time)
        require(
            lastPriceUpdate == 0 || block.timestamp - lastPriceUpdate >= priceValidityPeriod,
            "Price is still valid - wait for expiry"
        );
        
        // Fetch fresh price from Chainlink
        try priceFeed.latestRoundData() returns (
            uint80,
            int256 answer,
            uint256,
            uint256 updatedAt,
            uint80
        ) {
            require(answer > 0, "Invalid price from oracle");
            require(block.timestamp - updatedAt <= 24 hours, "Oracle price is stale");
            
            // Update cache
            cachedBNBPrice = uint256(answer);
            lastPriceUpdate = block.timestamp;
            
            emit BNBPriceUpdated(cachedBNBPrice, block.timestamp);
        } catch {
            revert("Failed to fetch price from oracle");
        }
    }

    /**
     * @dev Set how long cached price remains valid
     * @param _period Validity period in seconds (default: 7 days)
     */
    function setPriceValidityPeriod(uint256 _period) external onlyOwner {
        require(_period >= 1 days && _period <= 30 days, "Period must be 1-30 days");
        priceValidityPeriod = _period;
    }

    /**
     * @dev Force update BNB price immediately (admin only, bypasses validity period)
     * @notice Use this to manually set price outside the 7-day schedule
     */
    function forceUpdateBNBPrice() external onlyOwner {
        require(useOracle, "Oracle not enabled");
        require(address(priceFeed) != address(0), "Price feed not set");
        
        // Fetch fresh price from Chainlink (no time restriction)
        try priceFeed.latestRoundData() returns (
            uint80,
            int256 answer,
            uint256,
            uint256 updatedAt,
            uint80
        ) {
            require(answer > 0, "Invalid price from oracle");
            require(block.timestamp - updatedAt <= 24 hours, "Oracle price is stale");
            
            // Update cache
            cachedBNBPrice = uint256(answer);
            lastPriceUpdate = block.timestamp;
            
            emit BNBPriceUpdated(cachedBNBPrice, block.timestamp);
        } catch {
            revert("Failed to fetch price from oracle");
        }
    }

    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    /*//////////////////////////////////////////////////////////////
                        UPGRADE AUTHORIZATION
    //////////////////////////////////////////////////////////////*/
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    /*//////////////////////////////////////////////////////////////
                        RECEIVE FUNCTION
    //////////////////////////////////////////////////////////////*/
    receive() external payable {}
}
