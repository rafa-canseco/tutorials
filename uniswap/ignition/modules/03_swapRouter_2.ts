/// Swap ETH for ERC20

import * as dotenv from "dotenv";
dotenv.config();
import SwapRouterArtifact from "@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json"
import erc20Abi from "../../abis/erc20.json"
import { ethers } from "hardhat"
import  hardhat from "hardhat"

const provider = hardhat.ethers.provider

async function main() {
    const RECIPIENT = "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B"
    const impersonatedSigner = await ethers.getImpersonatedSigner(RECIPIENT)
    const impersonatedSignerAddress = await impersonatedSigner.getAddress()

    const wethContract =  new ethers.Contract("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", erc20Abi,impersonatedSigner )
    const usdcContract = new ethers.Contract("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", erc20Abi, impersonatedSigner)
    const swapRouterContract = new ethers.Contract("0xE592427A0AEce92De3Edee1F18E0157C05861564",SwapRouterArtifact.abi,impersonatedSigner)
    const routerAdress = await swapRouterContract.getAddress()

    async function logBalances(contract,address,decimals,name){
        const balance =  await contract.balanceOf(address);
        console.log(`${name}Balance:`, ethers.formatUnits(balance, decimals));
    }


    console.log("Before the trade")
    const ethBalanceBefore = await provider.getBalance(RECIPIENT)
    console.log("ETH Balance:", ethers.formatEther(ethBalanceBefore))
    await logBalances(wethContract,impersonatedSignerAddress,18,"WETH")
    await logBalances(usdcContract,impersonatedSignerAddress,6,"USDC")

    const inputAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2" //WETH
    const inputDecimals = 18
    const outputAddress = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
    const outputDecimals = 6
    const fee = 500
    const deadline = Math.floor(Date.now() / 1000 + 10 * 60);

    const tokensIn = "1"
    const amountIn = ethers.parseUnits(tokensIn, inputDecimals)
    const paramsInput = {
        tokenIn: inputAddress,
        tokenOut: outputAddress,
        recipient: RECIPIENT,
        deadline,
        amountIn,
        fee,
        amountOutMinimum: 0,
        sqrtPriceLimitX96:0,
    }

    const txInput= await swapRouterContract.connect(impersonatedSigner).exactInputSingle(
        paramsInput,
        {
            gasLimit: 1_000_000,
            value:amountIn,
        })
    await txInput.wait()
    
    console.log( "After the trade")
    const ethBalanceAfter = await provider.getBalance(RECIPIENT)
    console.log("ETH Balance:", ethers.formatEther(ethBalanceAfter))
    await logBalances(wethContract, impersonatedSignerAddress, 18, "weth");
    await logBalances(usdcContract, impersonatedSignerAddress, 6, "usd");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });