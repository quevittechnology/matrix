const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("UniversalMatrix", function () {
    let UniversalMatrix, matrix, RoyaltyVault, royaltyVault;
    let owner, feeReceiver, user1, user2, user3, user4, user5;
    let levelPrices, levelFees;

    beforeEach(async function () {
        [owner, feeReceiver, user1, user2, user3, user4, user5] = await ethers.getSigners();

        // Deploy RoyaltyVault
        RoyaltyVault = await ethers.getContractFactory("RoyaltyVault");
        royaltyVault = await RoyaltyVault.deploy(owner.address);
        await royaltyVault.waitForDeployment();

        // Deploy UniversalMatrix
        UniversalMatrix = await ethers.getContractFactory("UniversalMatrix");
        matrix = await upgrades.deployProxy(
            UniversalMatrix,
            [feeReceiver.address, await royaltyVault.getAddress(), owner.address],
            { initializer: "initialize", kind: "uups" }
        );
        await matrix.waitForDeployment();

        // Configure RoyaltyVault
        await royaltyVault.setUniversalMatrix(await matrix.getAddress());

        // Set level prices (required for tests to work)
        const prices = [
            ethers.parseEther("0.01"),  // Level 1
            ethers.parseEther("0.02"),  // Level 2
            ethers.parseEther("0.04"),  // Level 3
            ethers.parseEther("0.08"),  // Level 4
            ethers.parseEther("0.16"),  // Level 5
            ethers.parseEther("0.32"),  // Level 6
            ethers.parseEther("0.64"),  // Level 7
            ethers.parseEther("1.28"),  // Level 8
            ethers.parseEther("2.56"),  // Level 9
            ethers.parseEther("5.12"),  // Level 10
            ethers.parseEther("10.24"), // Level 11
            ethers.parseEther("20.48"), // Level 12
            ethers.parseEther("40.96")  // Level 13
        ];
        await matrix.updateLevelPrices(prices);

        // Get level prices
        [levelPrices, levelFees] = await matrix.getLevels();
    });

    describe("Deployment", function () {
        it("Should set the correct owner", async function () {
            expect(await matrix.owner()).to.equal(owner.address);
        });

        it("Should set the correct fee receiver", async function () {
            expect(await matrix.feeReceiver()).to.equal(feeReceiver.address);
        });

        it("Should initialize with 0 total users", async function () {
            expect(await matrix.totalUsers()).to.equal(0);
        });

        it("Should have correct level prices", async function () {
            expect(levelPrices.length).to.equal(13);
            expect(levelFees.length).to.equal(13);
        });
    });

    describe("Registration", function () {
        it("Should register a new user with default referrer", async function () {
            const defaultRefer = await matrix.defaultRefer();
            const cost = levelPrices[0] + (levelPrices[0] * levelFees[0] / 100n);

            await expect(
                matrix.connect(user1).register(defaultRefer, user1.address, { value: cost })
            ).to.emit(matrix, "Registered");

            const userId = await matrix.id(user1.address);
            expect(userId).to.not.equal(0);

            const userInfo = await matrix.userInfo(userId);
            expect(userInfo.account).to.equal(user1.address);
            expect(userInfo.level).to.equal(1);
            expect(userInfo.referrer).to.equal(defaultRefer);
        });

        it("Should register with a valid referrer", async function () {
            const defaultRefer = await matrix.defaultRefer();
            const cost = levelPrices[0] + (levelPrices[0] * levelFees[0] / 100n);

            // Register user1 first
            await matrix.connect(user1).register(defaultRefer, user1.address, { value: cost });
            const user1Id = await matrix.id(user1.address);

            // Register user2 with user1 as referrer
            await matrix.connect(user2).register(user1Id, user2.address, { value: cost });
            const user2Id = await matrix.id(user2.address);

            const user2Info = await matrix.userInfo(user2Id);
            expect(user2Info.referrer).to.equal(user1Id);

            const user1Info = await matrix.userInfo(user1Id);
            expect(user1Info.directTeam).to.equal(1);
        });

        it("Should revert if already registered", async function () {
            const defaultRefer = await matrix.defaultRefer();
            const cost = levelPrices[0] + (levelPrices[0] * levelFees[0] / 100n);

            await matrix.connect(user1).register(defaultRefer, user1.address, { value: cost });

            await expect(
                matrix.connect(user1).register(defaultRefer, user1.address, { value: cost })
            ).to.be.revertedWith("Already registered");
        });

        it("Should revert with invalid BNB amount", async function () {
            const defaultRefer = await matrix.defaultRefer();
            const wrongAmount = levelPrices[0];

            await expect(
                matrix.connect(user1).register(defaultRefer, user1.address, { value: wrongAmount })
            ).to.be.revertedWith("Invalid BNB amount");
        });

        it("Should pay referral commission", async function () {
            const defaultRefer = await matrix.defaultRefer();
            const cost = levelPrices[0] + (levelPrices[0] * levelFees[0] / 100n);

            await matrix.connect(user1).register(defaultRefer, user1.address, { value: cost });
            const user1Id = await matrix.id(user1.address);

            const balanceBefore = await ethers.provider.getBalance(user1.address);
            await matrix.connect(user2).register(user1Id, user2.address, { value: cost });
            const balanceAfter = await ethers.provider.getBalance(user1.address);

            // Sponsor receives 95% of level price (5% goes to admin)
            const expectedCommission = (levelPrices[0] * 95n) / 100n;
            expect(balanceAfter - balanceBefore).to.equal(expectedCommission);

            const user1Info = await matrix.userInfo(user1Id);
            expect(user1Info.referralIncome).to.be.gt(0);
            expect(user1Info.directTeam).to.equal(1);
        });
    });

    describe("Matrix Placement", function () {
        it("Should place users in binary matrix correctly", async function () {
            const defaultRefer = await matrix.defaultRefer();
            const cost = levelPrices[0] + (levelPrices[0] * levelFees[0] / 100n);

            // Register 3 users
            await matrix.connect(user1).register(defaultRefer, user1.address, { value: cost });
            const user1Id = await matrix.id(user1.address);

            await matrix.connect(user2).register(user1Id, user2.address, { value: cost });
            const user2Id = await matrix.id(user2.address);

            await matrix.connect(user3).register(user1Id, user3.address, { value: cost });
            const user3Id = await matrix.id(user3.address);

            // Check matrix structure
            const user2Info = await matrix.userInfo(user2Id);
            const user3Info = await matrix.userInfo(user3Id);

            expect(user2Info.upline).to.equal(user1Id);
            expect(user3Info.upline).to.equal(user1Id);

            const user1Info = await matrix.userInfo(user1Id);
            expect(user1Info.totalMatrixTeam).to.equal(2);
        });

        it("Should spillover to next available position", async function () {
            const defaultRefer = await matrix.defaultRefer();
            const cost = levelPrices[0] + (levelPrices[0] * levelFees[0] / 100n);

            // Register 4 users under user1
            await matrix.connect(user1).register(defaultRefer, user1.address, { value: cost });
            const user1Id = await matrix.id(user1.address);

            await matrix.connect(user2).register(user1Id, user2.address, { value: cost });
            await matrix.connect(user3).register(user1Id, user3.address, { value: cost });
            await matrix.connect(user4).register(user1Id, user4.address, { value: cost });

            const user4Id = await matrix.id(user4.address);
            const user4Info = await matrix.userInfo(user4Id);

            // User4 should spillover (not directly under user1)
            expect(user4Info.upline).to.not.equal(user1Id);
        });
    });

    describe("Upgrade System", function () {
        it("Should upgrade user level", async function () {
            const defaultRefer = await matrix.defaultRefer();
            const registerCost = levelPrices[0] + (levelPrices[0] * levelFees[0] / 100n);

            await matrix.connect(user1).register(defaultRefer, user1.address, { value: registerCost });
            const user1Id = await matrix.id(user1.address);

            const upgradeCost = levelPrices[1] + (levelPrices[1] * levelFees[1] / 100n);
            await matrix.connect(user1).upgrade(user1Id, 1, { value: upgradeCost });

            const userInfo = await matrix.userInfo(user1Id);
            expect(userInfo.level).to.equal(2);
        });

        it("Should upgrade multiple levels at once", async function () {
            const defaultRefer = await matrix.defaultRefer();
            const registerCost = levelPrices[0] + (levelPrices[0] * levelFees[0] / 100n);

            await matrix.connect(user1).register(defaultRefer, user1.address, { value: registerCost });
            const user1Id = await matrix.id(user1.address);

            let totalCost = 0n;
            for (let i = 1; i < 4; i++) {
                totalCost += levelPrices[i] + (levelPrices[i] * levelFees[i] / 100n);
            }

            await matrix.connect(user1).upgrade(user1Id, 3, { value: totalCost });

            const userInfo = await matrix.userInfo(user1Id);
            expect(userInfo.level).to.equal(4);
        });

        it("Should revert if not registered", async function () {
            const userId = 99999;
            const upgradeCost = levelPrices[1];

            await expect(
                matrix.connect(user1).upgrade(userId, 1, { value: upgradeCost })
            ).to.be.revertedWith("Register first");
        });

        it("Should revert if exceeding max level", async function () {
            const defaultRefer = await matrix.defaultRefer();
            const registerCost = levelPrices[0] + (levelPrices[0] * levelFees[0] / 100n);

            await matrix.connect(user1).register(defaultRefer, user1.address, { value: registerCost });
            const user1Id = await matrix.id(user1.address);

            await expect(
                matrix.connect(user1).upgrade(user1Id, 13, { value: ethers.parseEther("1") })
            ).to.be.revertedWith("Maximum level reached");
        });
    });

    describe("Income Distribution", function () {
        it("Should distribute level income to qualified upline", async function () {
            const defaultRefer = await matrix.defaultRefer();
            const cost = levelPrices[0] + (levelPrices[0] * levelFees[0] / 100n);

            // Register and upgrade user1 to level 4 (needs level > 2 for level 2 income)
            await matrix.connect(user1).register(defaultRefer, user1.address, { value: cost });
            const user1Id = await matrix.id(user1.address);

            // Need 2 direct referrals for qualification
            await matrix.connect(user2).register(user1Id, user2.address, { value: cost });
            await matrix.connect(user3).register(user1Id, user3.address, { value: cost });

            // Upgrade user1 to level 4 (level 2, 3, 4)
            const upgradeCost1 = levelPrices[1] + (levelPrices[1] * levelFees[1] / 100n);
            const upgradeCost2 = levelPrices[2] + (levelPrices[2] * levelFees[2] / 100n);
            const upgradeCost3 = levelPrices[3] + (levelPrices[3] * levelFees[3] / 100n);
            await matrix.connect(user1).upgrade(user1Id, 3, { 
                value: upgradeCost1 + upgradeCost2 + upgradeCost3 
            });

            // User2 upgrades to level 2 - user1 should receive income (user1 level 4 > 2)
            const user2Id = await matrix.id(user2.address);
            await matrix.connect(user2).upgrade(user2Id, 1, { value: upgradeCost1 });

            const user1Info = await matrix.userInfo(user1Id);
            expect(user1Info.levelIncome).to.be.gt(0);
        });
    });

    describe("Admin Functions", function () {
        it("Should pause and unpause contract", async function () {
            await matrix.connect(owner).setPaused(true);
            expect(await matrix.paused()).to.equal(true);

            const defaultRefer = await matrix.defaultRefer();
            const cost = levelPrices[0] + (levelPrices[0] * levelFees[0] / 100n);

            await expect(
                matrix.connect(user1).register(defaultRefer, user1.address, { value: cost })
            ).to.be.revertedWith("Contract paused");

            await matrix.connect(owner).setPaused(false);
            expect(await matrix.paused()).to.equal(false);
        });

        it("Should update fee receiver", async function () {
            await matrix.connect(owner).setFeeReceiver(user1.address);
            expect(await matrix.feeReceiver()).to.equal(user1.address);
        });

        it("Should revert if non-owner tries admin functions", async function () {
            await expect(
                matrix.connect(user1).setPaused(true)
            ).to.be.reverted;

            await expect(
                matrix.connect(user1).setFeeReceiver(user2.address)
            ).to.be.reverted;
        });
    });

    describe("View Functions", function () {
        it("Should return correct user information", async function () {
            const defaultRefer = await matrix.defaultRefer();
            const cost = levelPrices[0] + (levelPrices[0] * levelFees[0] / 100n);

            await matrix.connect(user1).register(defaultRefer, user1.address, { value: cost });
            const user1Id = await matrix.id(user1.address);

            const userInfo = await matrix.userInfo(user1Id);
            expect(userInfo.account).to.equal(user1.address);
            expect(userInfo.id).to.equal(user1Id);
        });

        it("Should return direct team users", async function () {
            const defaultRefer = await matrix.defaultRefer();
            const cost = levelPrices[0] + (levelPrices[0] * levelFees[0] / 100n);

            await matrix.connect(user1).register(defaultRefer, user1.address, { value: cost });
            const user1Id = await matrix.id(user1.address);

            await matrix.connect(user2).register(user1Id, user2.address, { value: cost });
            await matrix.connect(user3).register(user1Id, user3.address, { value: cost });

            const directTeam = await matrix.getDirectTeamUsers(user1Id, 10);
            expect(directTeam.length).to.equal(2);
        });

        it("Should return recent activities", async function () {
            const defaultRefer = await matrix.defaultRefer();
            const cost = levelPrices[0] + (levelPrices[0] * levelFees[0] / 100n);

            await matrix.connect(user1).register(defaultRefer, user1.address, { value: cost });
            await matrix.connect(user2).register(defaultRefer, user2.address, { value: cost });

            const activities = await matrix.getRecentActivities(10);
            expect(activities.length).to.equal(2);
        });
    });

    describe("Royalty System", function () {
        it("Should accumulate royalty funds", async function () {
            const defaultRefer = await matrix.defaultRefer();
            const cost = levelPrices[0] + (levelPrices[0] * levelFees[0] / 100n);

            // Register user first
            await matrix.connect(user1).register(defaultRefer, user1.address, { value: cost });
            const user1Id = await matrix.id(user1.address);

            // Royalty is only collected on upgrades, not registration
            const vaultBalanceBefore = await ethers.provider.getBalance(await royaltyVault.getAddress());
            const upgradeCost = levelPrices[1] + (levelPrices[1] * levelFees[1] / 100n);
            await matrix.connect(user1).upgrade(user1Id, 1, { value: upgradeCost });
            const vaultBalanceAfter = await ethers.provider.getBalance(await royaltyVault.getAddress());

            expect(vaultBalanceAfter).to.be.gt(vaultBalanceBefore);
        });
    });
});
