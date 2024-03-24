/// Swap ETH for

import * as dotenv from "dotenv";
dotenv.config();
import { ethers } from "hardhat";
import SwapRouterArtifact from "@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json";
import erc20Abi from "../../abis/erc20.json"

async function main() {
  const impersonatedSigner = await ethers.getImpersonatedSigner("0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B");
  const impersonatedSignerAddress = await impersonatedSigner.getAddress();
  const wethContract = new ethers.Contract("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", erc20Abi, impersonatedSigner);
  const usdcContract = new ethers.Contract("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", erc20Abi, impersonatedSigner);
  const swapRouterContract = new ethers.Contract("0xE592427A0AEce92De3Edee1F18E0157C05861564", SwapRouterArtifact.abi, impersonatedSigner);
  const routerAddress = await swapRouterContract.getAddress();

  async function logBalances(contract, address, decimals, name) {
    const balance = await contract.balanceOf(address);
    console.log(`${name}Balance:`, ethers.formatUnits(balance, decimals));
  }

  console.log("before the trade");
  await logBalances(wethContract, impersonatedSignerAddress, 18, "weth");
  await logBalances(usdcContract, impersonatedSignerAddress, 6, "usd");

  const inputAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
  const inputDecimals = 18;
  const outputAddress = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
  const ouputDecimals = 6;
  const fee = 500;
  const deadline = Math.floor(Date.now() / 1000 + 10 * 60);

  const approveTokens = "10";
  const approveIn = ethers.parseUnits(approveTokens, inputDecimals);
  await wethContract.connect(impersonatedSigner).approve(routerAddress, approveIn);

  console.log("after the trade");
  const tokensIn = "1";
  const amountIn = ethers.parseUnits(tokensIn, inputDecimals);
  const paramsInput = {
    tokenIn: inputAddress,
    tokenOut: outputAddress,
    recipient: "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B",
    deadline: deadline,
    amountIn: amountIn,
    fee,
    amountOutMinimum: 0,
    sqrtPriceLimitX96: 0,
  };

  const txInput = await swapRouterContract.connect(impersonatedSigner).exactInputSingle(paramsInput, { gasLimit: 1_000_000 });
  await txInput.wait();

  await logBalances(wethContract, impersonatedSignerAddress, 18, "weth");
  await logBalances(usdcContract, impersonatedSignerAddress, 6, "usd");

  const tokensOut="5000"
  const amountOut = ethers.parseUnits(tokensOut, ouputDecimals)
  const paramsOutput = {
    tokenIn: inputAddress,
    tokenOut: outputAddress,
    recipient: "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B",
    deadline: deadline,
    amountOut,
    fee,
    amountInMaximum: ethers.parseUnits("999", inputDecimals),
    sqrtPriceLimitX96: 0,
  }

  const txOutput = await swapRouterContract.connect(impersonatedSigner).exactOutputSingle(paramsOutput, { gasLimit: 1_000_000 })
  await txOutput.wait()

  await logBalances(wethContract, impersonatedSignerAddress, 18, "weth");
  await logBalances(usdcContract, impersonatedSignerAddress, 6, "usd");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
