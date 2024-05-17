//bun init
//instalar dependencias @uniswap/v3-periphery @uniswap/v3-core ethers
//touch .env
import Quoter2Artifact from "@uniswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json"
import PoolArtifact from "@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json"
import { ethers } from "ethers"

const provider = new ethers.JsonRpcProvider(process.env.RPC_ENDPOINT)

function sqrtToPrice(sqrt: number, token0Decimals: number, token1Decimals: number, isInputToken0: boolean): string {
    const numerator = sqrt ** 2
    const denominator = 2 ** 192
    let ratio = numerator / denominator
    const decimalDifference = token0Decimals - token1Decimals
    const decimalShift = Math.pow(10, decimalDifference)
    ratio *= decimalShift
    if (!isInputToken0) { ratio = 1 / ratio }
    return ratio.toString()
}

async function getPoolData(poolContract: ethers.Contract) {
    const { sqrtPriceX96 } = await poolContract.slot0()
    const token0 = await poolContract.token0()
    return { sqrtPriceX96, token0 }
}

async function getQuote(quoter2Contract: ethers.Contract, params: any) {
    return await quoter2Contract.quoteExactInputSingle.staticCall(params)
}

async function main() {
    const inputAddress = "0x6123B0049F904d730dB3C36a31167D9d4121fA6B"//RBN
    const inputDecimals = 18
    const outputAddress = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"//USDC
    const outputDecimals = 6
    const fee = 3000
    const tokensIn = "10000"

    const quoter2Contract = new ethers.Contract(
        "0x61fFE014bA17989E743c5F6cB21bF9697530B21e",
        Quoter2Artifact.abi,
        provider
    )

    const poolContract = new ethers.Contract(
        "0xFE0df74636Bc25C7F2400F22fe7dAE32D39443d2",
        PoolArtifact.abi,
        provider
    )

    try {
        const { sqrtPriceX96, token0 } = await getPoolData(poolContract)
        const isInputToken0 = token0 === inputAddress

        const amountIn = ethers.parseUnits(tokensIn, inputDecimals)
        const params = {
            tokenIn: inputAddress,
            tokenOut: outputAddress,
            amountIn,
            fee,
            sqrtPriceLimitX96: '0'
        }

        const quote = await getQuote(quoter2Contract, params)
        const { sqrtPriceX96After } = quote

        const price = sqrtToPrice(sqrtPriceX96.toString(), inputDecimals, outputDecimals, isInputToken0)
        const priceAfter = sqrtToPrice(sqrtPriceX96After.toString(), inputDecimals, outputDecimals, isInputToken0)


        const absoluteChange = -Math.abs(parseFloat(price) - parseFloat(priceAfter))
        const percentageChange = absoluteChange / parseFloat(price)
        const percent = (percentageChange * 100).toFixed(3)


        console.log('Price impact of swap:', percent, '%')
    } catch (error) {
        console.error('Error during the swap calculation:', error)
        process.exit(1)
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Unexpected error:', error)
        process.exit(1)
    })

