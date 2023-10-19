import {loadFixture} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import hre from "hardhat";
import {expect} from "chai";
import {parseEther} from "viem";

describe("OFTERC20", function () {
  const viem = hre.viem;
  async function deployContractsFixture() {
    const [owner, alice, bob] = await viem.getWalletClients();

    const chainId = 31337;
    const lzEndpoint = await viem.deployContract("LZEndpointMock", [chainId]);

    const oft = await viem.deployContract("OFTERC20");
    await oft.write.initialize([lzEndpoint.address]);

    const ownerAddress = owner.account.address;
    const aliceAddress = alice.account.address;
    const bobAddress = bob.account.address;

    return {oft, owner, alice, bob, ownerAddress, aliceAddress, bobAddress, lzEndpoint};
  }

  it("Approve", async function () {
    const {oft, aliceAddress, ownerAddress} = await loadFixture(deployContractsFixture);

    await oft.write.approve([aliceAddress, 75n]);
    expect(await oft.read.allowance([ownerAddress, aliceAddress])).to.eq(75n);
  });

  it("Cannot initialize twice", async function () {
    const {oft, lzEndpoint} = await loadFixture(deployContractsFixture);
    await expect(oft.write.initialize([lzEndpoint.address])).to.be.rejectedWith("InvalidInitialization");
  });

  it("Check initial mint was done", async function () {
    const {oft, ownerAddress} = await loadFixture(deployContractsFixture);
    expect(await oft.read.balanceOf([ownerAddress])).to.eq(parseEther("1000"));
  });

  describe("Burning", async function () {
    it("Basic burn", async function () {
      const {oft, ownerAddress} = await loadFixture(deployContractsFixture);

      await oft.write.burn([parseEther("750")]);
      expect(await oft.read.balanceOf([ownerAddress])).to.eq(parseEther("250"));
    });

    it("Burning with approval", async function () {
      const {oft, ownerAddress, aliceAddress} = await loadFixture(deployContractsFixture);

      await oft.write.approve([aliceAddress, parseEther("1000")]);

      await oft.write.burnFrom([ownerAddress, parseEther("750")], {account: aliceAddress});
      expect(await oft.read.balanceOf([ownerAddress])).to.eq(parseEther("250"));
      expect(await oft.read.allowance([ownerAddress, aliceAddress])).to.eq(parseEther("250"));
    });
  });

  describe("Transferring", async function () {
    it("Basic transfer", async function () {
      const {oft, ownerAddress, aliceAddress} = await loadFixture(deployContractsFixture);

      await oft.write.transfer([aliceAddress, parseEther("750")]);
      expect(await oft.read.balanceOf([ownerAddress])).to.eq(parseEther("250"));
    });

    it("Transferring with approval", async function () {
      const {oft, ownerAddress, aliceAddress} = await loadFixture(deployContractsFixture);

      await oft.write.approve([aliceAddress, parseEther("1000")]);
      await oft.write.transferFrom([ownerAddress, aliceAddress, parseEther("750")], {account: aliceAddress});
      expect(await oft.read.balanceOf([ownerAddress])).to.eq(parseEther("250"));
      expect(await oft.read.balanceOf([aliceAddress])).to.eq(parseEther("750"));
      expect(await oft.read.allowance([ownerAddress, aliceAddress])).to.eq(parseEther("250"));
    });
  });

  it("Only admin can call recoverToken()", async function () {
    const {oft, ownerAddress, aliceAddress} = await loadFixture(deployContractsFixture);
    await oft.write.transfer([oft.address, parseEther("100")]);
    await expect(oft.write.recoverToken([oft.address, parseEther("100")], {account: aliceAddress})).to.be.rejectedWith(
      "OwnableUnauthorizedAccount"
    );
    await oft.write.recoverToken([oft.address, parseEther("100")]);
    expect(await oft.read.balanceOf([ownerAddress])).to.eq(parseEther("1000"));
  });

  it("supportsInterface", async function () {
    const {oft} = await loadFixture(deployContractsFixture);
    expect(await oft.read.supportsInterface(["0x1f7ecdf7"])).to.be.true; // IOFTV2
  });
});
