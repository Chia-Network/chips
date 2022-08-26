const provider = window.chia;

const mnemonic = 'method private fence fish entry zero motion garden hurt cotton token earth carry today notable sight peanut remain finger stereo raccoon trade tube capital';

provider.request({ method: 'chainId' })
    .then((chainId) => {
        const expectChainId = 'mainnet';
    });

// check if wallet is connected
provider.request({ method: 'connect', params: { eager: true } })
    .then((value) => {
        const expectedValue = true; //
    })
    .catch((e) => {
        // wallet is disconnected
    })

// connect to wallet and ask user to approve
provider.request({ method: 'connect' })
    .then((value) => {
        // user approve
    })
    .catch((e) => {
        // user reject
    })

provider.request({
    method: 'walletSwitchChain',
    params: { chainId: 'mainnet' },
}).then(() => {
    // user approve
}).catch((e) => {
    // user reject
})

provider.request({ method: 'getPublicKeys', params: { offset: 0, limit: 2 } })
    .then((publicKeys) => {
        const expectedPublicKeys = [
            '0x858024f64b04a9abc6622a61e2c823b78a43d219c502719d12a78fd6cad5daa31f80254b1803689a9433960c609f9b92', // index 0, hardened
            '0xb3b8e545bf3ad7c786579ee6e3f19eaed5531622b8c7a7e538d5c325a74a359586461919d97f8cb12c41c64722488aff', // index 0, unhardened
        ]
    })

provider.request({
    method: 'filterUnlockedCoins',
    params: {
        coinNames: ['0xf58774e1d24a67b4d4098416b46987e4842fae72f858b6152db13c720245e919', '0xab7c7ec8f5b676dcc32020b9b5142f00db6d49e9a55c9df5b76f541c7eb7c60c']
    }
}).then((names) => {
    const expectedNames = ['0xf58774e1d24a67b4d4098416b46987e4842fae72f858b6152db13c720245e919']
})

// get xch coins
provider.request({
    method: 'getAssetCoins',
    params: {
        assetId: null,
        type: null,
        includedLocked: true,
        offset: 0,
        limit: 500
    }
}).then((rows) => {
    const expectedRows = [
        {
            coin: {
                parent_coin_info: '0xab7c7ec8f5b676dcc32020b9b5142f00db6d49e9a55c9df5b76f541c7eb7c60c',
                puzzle_hash: '0x302a133f2ae945154a1d657af6fa8c976794aa4c6c95e6e5a5aba72c68b06252',
                amount: 2000
            },
            coinName: '0xf58774e1d24a67b4d4098416b46987e4842fae72f858b6152db13c720245e919',
            puzzle: '0xff02ffff01ff02ffff01ff02ffff03ff0bffff01ff02ffff03ffff09ff05ffff1dff0bffff1effff0bff0bffff02ff06ffff04ff02ffff04ff17ff8080808080808080ffff01ff02ff17ff2f80ffff01ff088080ff0180ffff01ff04ffff04ff04ffff04ff05ffff04ffff02ff06ffff04ff02ffff04ff17ff80808080ff80808080ffff02ff17ff2f808080ff0180ffff04ffff01ff32ff02ffff03ffff07ff0580ffff01ff0bffff0102ffff02ff06ffff04ff02ffff04ff09ff80808080ffff02ff06ffff04ff02ffff04ff0dff8080808080ffff01ff0bffff0101ff058080ff0180ff018080ffff04ffff01b0931da5c511ac835cc96e76e1e03e4b3fc30808e4dafe0015c9bbe7afd5bfb138db8d18905edaaa77d69e5d581459932aff018080',
            confirmedBlockIndex: 1856394,
            locked: false,
        }
    ]
})

// get cat coins
provider.request({
    method: 'getAssetCoins',
    params: {
        assetId: '6a27da5e9e178a1f42c003a4c25d9dbab4054eb0720e1b57edd367f26bf50e79',
        type: 'cat',
        includedLocked: true,
        offset: 0,
        limit: 500
    }
}).then((rows) => {
    const expectedRows = [
        {
            "coin": {
                "parent_coin_info": "0x2e68be18df0ec786feac22c654f83396dd2223bf9425401e2161421246d0bd57",
                "puzzle_hash": "0x5e4b1069c443a93f324497fc491b1b97f8d11cb8ef147b159c0da464837003fb",
                "amount": 1000
            },
            "coinName": "0xedb3d2e5f6fdf7be69768a5dd5ae5b1b6dff7816e9fd9299486a4c47cbe5b000",
            "puzzle": "0xff02ffff01ff02ffff01ff02ff5effff04ff02ffff04ffff04ff05ffff04ffff0bff34ff0580ffff04ff0bff80808080ffff04ffff02ff17ff2f80ffff04ff5fffff04ffff02ff2effff04ff02ffff04ff17ff80808080ffff04ffff02ff2affff04ff02ffff04ff82027fffff04ff82057fffff04ff820b7fff808080808080ffff04ff81bfffff04ff82017fffff04ff8202ffffff04ff8205ffffff04ff820bffff80808080808080808080808080ffff04ffff01ffffffff3d46ff02ff333cffff0401ff01ff81cb02ffffff20ff02ffff03ff05ffff01ff02ff32ffff04ff02ffff04ff0dffff04ffff0bff7cffff0bff34ff2480ffff0bff7cffff0bff7cffff0bff34ff2c80ff0980ffff0bff7cff0bffff0bff34ff8080808080ff8080808080ffff010b80ff0180ffff02ffff03ffff22ffff09ffff0dff0580ff2280ffff09ffff0dff0b80ff2280ffff15ff17ffff0181ff8080ffff01ff0bff05ff0bff1780ffff01ff088080ff0180ffff02ffff03ff0bffff01ff02ffff03ffff09ffff02ff2effff04ff02ffff04ff13ff80808080ff820b9f80ffff01ff02ff56ffff04ff02ffff04ffff02ff13ffff04ff5fffff04ff17ffff04ff2fffff04ff81bfffff04ff82017fffff04ff1bff8080808080808080ffff04ff82017fff8080808080ffff01ff088080ff0180ffff01ff02ffff03ff17ffff01ff02ffff03ffff20ff81bf80ffff0182017fffff01ff088080ff0180ffff01ff088080ff018080ff0180ff04ffff04ff05ff2780ffff04ffff10ff0bff5780ff778080ffffff02ffff03ff05ffff01ff02ffff03ffff09ffff02ffff03ffff09ff11ff5880ffff0159ff8080ff0180ffff01818f80ffff01ff02ff26ffff04ff02ffff04ff0dffff04ff0bffff04ffff04ff81b9ff82017980ff808080808080ffff01ff02ff7affff04ff02ffff04ffff02ffff03ffff09ff11ff5880ffff01ff04ff58ffff04ffff02ff76ffff04ff02ffff04ff13ffff04ff29ffff04ffff0bff34ff5b80ffff04ff2bff80808080808080ff398080ffff01ff02ffff03ffff09ff11ff7880ffff01ff02ffff03ffff20ffff02ffff03ffff09ffff0121ffff0dff298080ffff01ff02ffff03ffff09ffff0cff29ff80ff3480ff5c80ffff01ff0101ff8080ff0180ff8080ff018080ffff0109ffff01ff088080ff0180ffff010980ff018080ff0180ffff04ffff02ffff03ffff09ff11ff5880ffff0159ff8080ff0180ffff04ffff02ff26ffff04ff02ffff04ff0dffff04ff0bffff04ff17ff808080808080ff80808080808080ff0180ffff01ff04ff80ffff04ff80ff17808080ff0180ffff02ffff03ff05ffff01ff04ff09ffff02ff56ffff04ff02ffff04ff0dffff04ff0bff808080808080ffff010b80ff0180ff0bff7cffff0bff34ff2880ffff0bff7cffff0bff7cffff0bff34ff2c80ff0580ffff0bff7cffff02ff32ffff04ff02ffff04ff07ffff04ffff0bff34ff3480ff8080808080ffff0bff34ff8080808080ffff02ffff03ffff07ff0580ffff01ff0bffff0102ffff02ff2effff04ff02ffff04ff09ff80808080ffff02ff2effff04ff02ffff04ff0dff8080808080ffff01ff0bffff0101ff058080ff0180ffff04ffff04ff30ffff04ff5fff808080ffff02ff7effff04ff02ffff04ffff04ffff04ff2fff0580ffff04ff5fff82017f8080ffff04ffff02ff26ffff04ff02ffff04ff0bffff04ff05ffff01ff808080808080ffff04ff17ffff04ff81bfffff04ff82017fffff04ffff02ff2affff04ff02ffff04ff8204ffffff04ffff02ff76ffff04ff02ffff04ff09ffff04ff820affffff04ffff0bff34ff2d80ffff04ff15ff80808080808080ffff04ff8216ffff808080808080ffff04ff8205ffffff04ff820bffff808080808080808080808080ff02ff5affff04ff02ffff04ff5fffff04ff3bffff04ffff02ffff03ff17ffff01ff09ff2dffff02ff2affff04ff02ffff04ff27ffff04ffff02ff76ffff04ff02ffff04ff29ffff04ff57ffff04ffff0bff34ff81b980ffff04ff59ff80808080808080ffff04ff81b7ff80808080808080ff8080ff0180ffff04ff17ffff04ff05ffff04ff8202ffffff04ffff04ffff04ff78ffff04ffff0eff5cffff02ff2effff04ff02ffff04ffff04ff2fffff04ff82017fff808080ff8080808080ff808080ffff04ffff04ff20ffff04ffff0bff81bfff5cffff02ff2effff04ff02ffff04ffff04ff15ffff04ffff10ff82017fffff11ff8202dfff2b80ff8202ff80ff808080ff8080808080ff808080ff138080ff80808080808080808080ff018080ffff04ffff01a037bef360ee858133b69d595a906dc45d01af50379dad515eb9518abb7c1d2a7affff04ffff01a06a27da5e9e178a1f42c003a4c25d9dbab4054eb0720e1b57edd367f26bf50e79ffff04ffff01ff02ffff01ff02ffff01ff02ffff03ff0bffff01ff02ffff03ffff09ff05ffff1dff0bffff1effff0bff0bffff02ff06ffff04ff02ffff04ff17ff8080808080808080ffff01ff02ff17ff2f80ffff01ff088080ff0180ffff01ff04ffff04ff04ffff04ff05ffff04ffff02ff06ffff04ff02ffff04ff17ff80808080ff80808080ffff02ff17ff2f808080ff0180ffff04ffff01ff32ff02ffff03ffff07ff0580ffff01ff0bffff0102ffff02ff06ffff04ff02ffff04ff09ff80808080ffff02ff06ffff04ff02ffff04ff0dff8080808080ffff01ff0bffff0101ff058080ff0180ff018080ffff04ffff01b08266b475a8e43ab2ac32f49d7cf7835b7f45b8c242288f6226e275ea5ccc29f199333ba894ba3782b963c79ea65fe792ff018080ff0180808080",
            "confirmedBlockIndex": 1364880,
            "locked": false,
            "lineageProof": {
                "parentName": "0x3be9f3038b62f7ec995f0ec121921a278d2da60e65a8bb0d80e12f04b9ac4677",
                "innerPuzzleHash": "0x7ca01b94450e565305c5e26c79248a32391d41f1cf885966d1c4aa7a4e5e2c76",
                "amount": 1000
            }
        }
    ]
})

provider.request({
    method: 'getAssetBalance',
    params: {
        type: null,
        assetId: null
    }
}).then((balance) => {
    const expectBalance = {
        confirmed: "2000",
        spendable: "2000",
        spendableCoinCount: 1,
    };
})

provider.request({
    method: 'signCoinSpends',
    params: {
        coinSpends: [
            {
                'coin': {
                    'parent_coin_info': '0xab7c7ec8f5b676dcc32020b9b5142f00db6d49e9a55c9df5b76f541c7eb7c60c',
                    'puzzle_hash': '0x302a133f2ae945154a1d657af6fa8c976794aa4c6c95e6e5a5aba72c68b06252',
                    'amount': 2000
                },
                'puzzle_reveal': '0xff02ffff01ff02ffff01ff02ffff03ff0bffff01ff02ffff03ffff09ff05ffff1dff0bffff1effff0bff0bffff02ff06ffff04ff02ffff04ff17ff8080808080808080ffff01ff02ff17ff2f80ffff01ff088080ff0180ffff01ff04ffff04ff04ffff04ff05ffff04ffff02ff06ffff04ff02ffff04ff17ff80808080ff80808080ffff02ff17ff2f808080ff0180ffff04ffff01ff32ff02ffff03ffff07ff0580ffff01ff0bffff0102ffff02ff06ffff04ff02ffff04ff09ff80808080ffff02ff06ffff04ff02ffff04ff0dff8080808080ffff01ff0bffff0101ff058080ff0180ff018080ffff04ffff01b0931da5c511ac835cc96e76e1e03e4b3fc30808e4dafe0015c9bbe7afd5bfb138db8d18905edaaa77d69e5d581459932aff018080',
                'solution': '0xff80ffff01ffff33ffa0302a133f2ae945154a1d657af6fa8c976794aa4c6c95e6e5a5aba72c68b06252ff8203e88080ff8080', // conditions: [[51, '302a133f2ae945154a1d657af6fa8c976794aa4c6c95e6e5a5aba72c68b06252', 1000]]
            }
        ],
    }
}).then((resp) => {
    const expectResp = '0x8fbfaed731345ad21a47165930a191df40c36aeae4d3fcd7ca79e4a5e54b0c588ea6bc683453bbd2a770d2bf46c0563a14d509e233c825198680e3b25afceb7a64be50782102ace7dd872855eb0061bc60626eae0094d9cdbd8a99ad3d2b5dde'
})

provider.request({
    method: 'signMessage',
    params: {
        message: '0x68656c6c6f2063686961', // "hello chia"
        publicKey: '0x858024f64b04a9abc6622a61e2c823b78a43d219c502719d12a78fd6cad5daa31f80254b1803689a9433960c609f9b92',
    }
}).then((resp) => {
    const expectResp = '0x8ee997eb62ad11a9b781d123862d3fe9cfb65a7862c1e0a86618c739119d636a85722e87bdbc3da4cd5a1676dc3836c617a2b176e91dd7b8f8d126fbec509d751e2f811db009a01d0a4438b3c2eaf99b51b76d805700405564b9fc7b52a29625'
})

provider.requst({
    method: 'sendTransaction',
    params: {
        spendBundle: {
            'aggregated_signature': '0x8fbfaed731345ad21a47165930a191df40c36aeae4d3fcd7ca79e4a5e54b0c588ea6bc683453bbd2a770d2bf46c0563a14d509e233c825198680e3b25afceb7a64be50782102ace7dd872855eb0061bc60626eae0094d9cdbd8a99ad3d2b5dde',
            'coin_solutions': [
                {
                    'coin': {
                        'parent_coin_info': '0xab7c7ec8f5b676dcc32020b9b5142f00db6d49e9a55c9df5b76f541c7eb7c60c',
                        'puzzle_hash': '0x302a133f2ae945154a1d657af6fa8c976794aa4c6c95e6e5a5aba72c68b06252',
                        'amount': 2000
                    },
                    'puzzle_reveal': '0xff02ffff01ff02ffff01ff02ffff03ff0bffff01ff02ffff03ffff09ff05ffff1dff0bffff1effff0bff0bffff02ff06ffff04ff02ffff04ff17ff8080808080808080ffff01ff02ff17ff2f80ffff01ff088080ff0180ffff01ff04ffff04ff04ffff04ff05ffff04ffff02ff06ffff04ff02ffff04ff17ff80808080ff80808080ffff02ff17ff2f808080ff0180ffff04ffff01ff32ff02ffff03ffff07ff0580ffff01ff0bffff0102ffff02ff06ffff04ff02ffff04ff09ff80808080ffff02ff06ffff04ff02ffff04ff0dff8080808080ffff01ff0bffff0101ff058080ff0180ff018080ffff04ffff01b0931da5c511ac835cc96e76e1e03e4b3fc30808e4dafe0015c9bbe7afd5bfb138db8d18905edaaa77d69e5d581459932aff018080',
                    'solution': '0xff80ffff01ffff33ffa0302a133f2ae945154a1d657af6fa8c976794aa4c6c95e6e5a5aba72c68b06252ff8203e88080ff8080'
                }
            ]
        }
    }
}).then((resp) => {
    const expectResp = [{
        status: 1
    }]
})
