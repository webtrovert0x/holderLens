const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HolderLens Smart Contract", function () {
  let holderLens;
  let owner;
  let user1;
  let dummyToken;

  beforeEach(async function () {
    [owner, user1] = await ethers.getSigners();

    const HolderLens = await ethers.getContractFactory("HolderLens");
    holderLens = await HolderLens.deploy();
    await holderLens.waitForDeployment();

    // Use a dummy address for token
    dummyToken = "0x1111111111111111111111111111111111111111";
  });

  it("should initialize with zero checks and snapshots", async function () {
    expect(await holderLens.totalChecks()).to.equal(0);
    expect(await holderLens.totalSnapshotsAnchored()).to.equal(0);
  });

  it("should record a holder check and emit HolderCheckRecorded", async function () {
    const tx = await holderLens.connect(user1).recordHolderCheck(dummyToken);
    const receipt = await tx.wait();

    expect(await holderLens.totalChecks()).to.equal(1);
    expect(await holderLens.tokenCheckCount(dummyToken)).to.equal(1);
    expect(await holderLens.userTokenCheckCount(user1.address, dummyToken)).to.equal(1);

    await expect(tx)
      .to.emit(holderLens, "HolderCheckRecorded")
      .withArgs(user1.address, dummyToken, 1, (val) => val > 0);
  });

  it("should revert check if token is address(0)", async function () {
    await expect(
      holderLens.recordHolderCheck(ethers.ZeroAddress)
    ).to.be.revertedWith("Invalid token address");
  });

  it("should record and anchor a snapshot on-chain", async function () {
    const totalHolders = 142;
    const top10ConcentrationBps = 6840; // 68.40%
    const snapshotHash = ethers.keccak256(ethers.toUtf8Bytes("snapshot-data-v1"));

    const tx = await holderLens.connect(user1).recordSnapshot(
      dummyToken,
      totalHolders,
      top10ConcentrationBps,
      snapshotHash
    );
    await tx.wait();

    expect(await holderLens.totalSnapshotsAnchored()).to.equal(1);

    const [exists, latest] = await holderLens.getLatestSnapshot(dummyToken);
    expect(exists).to.be.true;
    expect(latest.totalHolders).to.equal(totalHolders);
    expect(latest.top10ConcentrationBps).to.equal(top10ConcentrationBps);
    expect(latest.snapshotHash).to.equal(snapshotHash);
    expect(latest.recorder).to.equal(user1.address);
  });

  it("should return token stats correctly", async function () {
    await holderLens.recordHolderCheck(dummyToken);
    const stats = await holderLens.getTokenStats(dummyToken);
    expect(stats.checkCount).to.equal(1);
    expect(stats.snapshotCount).to.equal(0);
    expect(stats.lastCheckTimestamp).to.be.gt(0);
  });
});
