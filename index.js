const express = require('express');
const axios = require('axios');
const { Requester, Validator } = require('@chainlink/external-adapter');
const { ethers } = require('ethers');

const PORT = 8080;

// 聚合器合约地址和ABI
const AGGREGATOR_ADDRESS = '0xC69498d27A4A681A02E92A137c86074E48FA0463'

const AGGREGATOR_ABI = [
    {
        "constant": true,
        "inputs": [],
        "name": "latestRoundData",
        "outputs": [
            {
                "name": "roundId",
                "type": "uint80"
            },
            {
                "name": "answer",
                "type": "int256"
            },
            {
                "name": "startedAt",
                "type": "uint256"
            },
            {
                "name": "updatedAt",
                "type": "uint256"
            },
            {
                "name": "answeredInRound",
                "type": "uint80"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }
];


// 连接到Ethereum网络

const getLatestPrice = async () => {
    const provider = new ethers.providers.JsonRpcProvider('https://goerli-rollup.arbitrum.io/rpc');
    const aggregator = new ethers.Contract(AGGREGATOR_ADDRESS, AGGREGATOR_ABI, provider);
    console.log("aggregator address: ", aggregator.address);
    const { answer } = await aggregator.latestRoundData();
    return answer.toString();
};


const app = express();

app.use(express.json());

app.post('/adapter', async (req, res) => {

    // console.log("req ", req)

    // if (req.body.token !== 'USDA') {
    //     return res.status(400).json({ jobRunID: req.body.id, status: 'errored', error: 'Invalid token. Only USDA is supported.' });
    // }

    try {
        const price = await getLatestPrice();
        const response = {
            jobRunID: req.body.id,
            data: { price },
            result: price,
            statusCode: 200
        };
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
});
