import "dotenv/config"
import  Quoter2Artifact  from "@uniswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json"
import PoolArtifact from "@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json"
import {ethers} from "ethers"

const provider = new ethers.JsonRpcProvider( process.env.RPC_ENDPOINT)

function sqrtToPrice(sqrt, token0Decimals, token1Decimals, isInputToken0): string {
    const numerator = sqrt ** 2
    const denominator = 2 ** 192
    let ratio = numerator / denominator
    const decimalDifference = token0Decimals - token1Decimals
    const decimalShift = Math.pow(10, decimalDifference)
    ratio = ratio * decimalShift
    if(!isInputToken0) { ratio = 1 / ratio }
    return ratio
}

async function main() {
    const inputAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
    const inputDecimals = 18
    const outputAddress = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
    const outputDecimals = 6
    const fee = 500
    const tokensIn = "10000"

const quoter2Contract = new ethers.Contract(
    "0x61fFE014bA17989E743c5F6cB21bF9697530B21e",
    Quoter2Artifact.abi,
    provider
)

const poolContract = new ethers.Contract(
    "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640",
    PoolArtifact.abi,
    provider
)

const slot0 = await poolContract.slot0()
const sqrtPriceX96 = slot0.sqrtPriceX96

    
const token0 = await poolContract.token0()
const isInputToken0 = token0 === inputAddress

const amountIn = ethers.parseUnits(tokensIn,inputDecimals)
const params = {
    tokenIn: inputAddress,
    tokenOut: outputAddress,
    amountIn,
    fee,
    sqrtPriceLimitX96: '0'
}


const quote = await quoter2Contract.quoteExactInputSingle.staticCall(params)
const sqrtPriceX96After = quote.sqrtPriceX96After

const price = sqrtToPrice(sqrtPriceX96.toString(), inputDecimals, outputDecimals, isInputToken0)
const priceAfter = sqrtToPrice(sqrtPriceX96After.toString(), inputDecimals, outputDecimals, isInputToken0)

const absoluteChange = -Math.abs(price - priceAfter)
const percentageChange = absoluteChange / price
const percent = (percentageChange * 100).toFixed(3)

console.log('Price impact of swap:', percent, '%')

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });