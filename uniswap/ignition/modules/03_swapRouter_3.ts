import * as dotenv from "dotenv";
dotenv.config();
import erc20Abi from "../../abis/erc20.json"
import { ethers } from "hardhat";
import hardhat from "hardhat"
import SwapRouterArtifact from "@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json"


const provider = hardhat.ethers.provider
const RECIPIENT = "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B"

async function main (){
const impersonatedSigner = await ethers.getImpersonatedSigner(RECIPIENT)
const impersonatedSignerAddress = await impersonatedSigner.getAddress()

const wethContract = new ethers.Contract("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",erc20Abi,impersonatedSigner)
const usdcContract = new ethers.Contract("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",erc20Abi,impersonatedSigner)
const swapRouterContract = new ethers.Contract("0xE592427A0AEce92De3Edee1F18E0157C05861564",SwapRouterArtifact.abi,impersonatedSigner)
const routerAdress = await swapRouterContract.getAddress()


    async function logBalances(contract,address,decimals,name){
        const balance =  await contract.balanceOf(address);
        console.log(`${name}Balance:`, ethers.formatUnits(balance, decimals));
    }

    const inputAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
    const inputDecimals = 18

    console.log("Before the trade")
    const ethBalanceBefore = await provider.getBalance(RECIPIENT)
    console.log("ETH Balance:", ethers.formatEther(ethBalanceBefore))
    await logBalances(wethContract,impersonatedSignerAddress,18,"WETH")
    await logBalances(usdcContract,impersonatedSignerAddress,6,"USDC")
    
    const tokenIn = "3"
    const amountIn = await ethers.parseUnits(tokenIn, inputDecimals)

    const params = {
        to: inputAddress,
        value: amountIn,
    }

    const tx = await impersonatedSigner.sendTransaction(params)
    await tx.wait()

    console.log("After the trade")
    const ethBalanceAfter = await provider.getBalance(RECIPIENT)
    console.log("ETH Balance:", ethers.formatEther(ethBalanceAfter))
    await logBalances(wethContract,impersonatedSignerAddress,18,"WETH")
    await logBalances(usdcContract,impersonatedSignerAddress,6,"USDC")



}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });