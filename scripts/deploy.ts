import hre from "hardhat";

async function main() {
  const viem = hre.viem;
  const chainId = 31337;
  const lzEndpoint = await viem.deployContract("LZEndpointMock", [chainId]);
  const oft = await viem.deployContract("OFTERC20");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
