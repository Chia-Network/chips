const provider = window.chia;
const mnemonic = 'method private fence fish entry zero motion garden hurt cotton token earth carry today notable sight peanut remain finger stereo raccoon trade tube capital';

provider.request({ method: 'addresses' })
  .then((accounts) => {
    const expectAccounts = [
      '302a133f2ae945154a1d657af6fa8c976794aa4c6c95e6e5a5aba72c68b06252', // index 0, hardened
      '301a3312ea65f930ae26c862758845c7b1cba8dfc5fb12e3c92525655e111183', // index 0, unhardened
    ]
  })

provider.request({ method: 'chainId' })
  .then((chainId) => {
    const expectChainId = 'mainnet';
  });

provider.request({
  method: 'walletSwitchChain',
  params: { chainId: 'mainnet' },
}).then(() => {
  // empty
})

provider.request({
  method: 'selectAssetCoins',
  params: {
    assetId: null,
    amount: 1000, // mojo
    excludes: ['ab7c7ec8f5b676dcc32020b9b5142f00db6d49e9a55c9df5b76f541c7eb7c60c',],
  }
}).then((coinRecords) => {
  const expectedCoinRecords = [
    {
      coin: {
        parent_coin_info: 'ab7c7ec8f5b676dcc32020b9b5142f00db6d49e9a55c9df5b76f541c7eb7c60c',
        puzzle_hash: '302a133f2ae945154a1d657af6fa8c976794aa4c6c95e6e5a5aba72c68b06252',
        amount: 2000
      },
      coinName: 'f58774e1d24a67b4d4098416b46987e4842fae72f858b6152db13c720245e919',
      puzzle: 'ff02ffff01ff02ffff01ff02ffff03ff0bffff01ff02ffff03ffff09ff05ffff1dff0bffff1effff0bff0bffff02ff06ffff04ff02ffff04ff17ff8080808080808080ffff01ff02ff17ff2f80ffff01ff088080ff0180ffff01ff04ffff04ff04ffff04ff05ffff04ffff02ff06ffff04ff02ffff04ff17ff80808080ff80808080ffff02ff17ff2f808080ff0180ffff04ffff01ff32ff02ffff03ffff07ff0580ffff01ff0bffff0102ffff02ff06ffff04ff02ffff04ff09ff80808080ffff02ff06ffff04ff02ffff04ff0dff8080808080ffff01ff0bffff0101ff058080ff0180ff018080ffff04ffff01b0931da5c511ac835cc96e76e1e03e4b3fc30808e4dafe0015c9bbe7afd5bfb138db8d18905edaaa77d69e5d581459932aff018080',
      confirmedBlockIndex: 1856394,
      timestamp: 1650315703,
      locked: false,
    }
  ]
})

provider.request({
  method: 'getAssetBalance',
  params: {
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
  method: 'getPublicKeyByAddress',
  params: {
    address: '302a133f2ae945154a1d657af6fa8c976794aa4c6c95e6e5a5aba72c68b06252',
  }
}).then((publicKey) => {
  const expectPublicKey = '858024f64b04a9abc6622a61e2c823b78a43d219c502719d12a78fd6cad5daa31f80254b1803689a9433960c609f9b92';
})

provider.request({
  method: 'signTransaction',
  params: {
    coinSpends: [
      {
        'coin': {
          'parent_coin_info': 'ab7c7ec8f5b676dcc32020b9b5142f00db6d49e9a55c9df5b76f541c7eb7c60c',
          'puzzle_hash': '302a133f2ae945154a1d657af6fa8c976794aa4c6c95e6e5a5aba72c68b06252',
          'amount': 2000
        },
        'puzzle_reveal': 'ff02ffff01ff02ffff01ff02ffff03ff0bffff01ff02ffff03ffff09ff05ffff1dff0bffff1effff0bff0bffff02ff06ffff04ff02ffff04ff17ff8080808080808080ffff01ff02ff17ff2f80ffff01ff088080ff0180ffff01ff04ffff04ff04ffff04ff05ffff04ffff02ff06ffff04ff02ffff04ff17ff80808080ff80808080ffff02ff17ff2f808080ff0180ffff04ffff01ff32ff02ffff03ffff07ff0580ffff01ff0bffff0102ffff02ff06ffff04ff02ffff04ff09ff80808080ffff02ff06ffff04ff02ffff04ff0dff8080808080ffff01ff0bffff0101ff058080ff0180ff018080ffff04ffff01b0931da5c511ac835cc96e76e1e03e4b3fc30808e4dafe0015c9bbe7afd5bfb138db8d18905edaaa77d69e5d581459932aff018080',
        'solution': 'ff80ffff01ffff33ffa0302a133f2ae945154a1d657af6fa8c976794aa4c6c95e6e5a5aba72c68b06252ff8203e88080ff8080', // conditions: [[51, '302a133f2ae945154a1d657af6fa8c976794aa4c6c95e6e5a5aba72c68b06252', 1000]]
      }
    ],
    broadcast: false,
  }
}).then((resp) => {
  const expectResp = {
    id: '5f6491a13db734323c1f9487e77a537a3d77139f4ace16da7248e1739543e43a', // spendbundle.name()
    transaction: {
      'aggregated_signature': '8fbfaed731345ad21a47165930a191df40c36aeae4d3fcd7ca79e4a5e54b0c588ea6bc683453bbd2a770d2bf46c0563a14d509e233c825198680e3b25afceb7a64be50782102ace7dd872855eb0061bc60626eae0094d9cdbd8a99ad3d2b5dde',
      'coin_solutions': [
        {
          'coin': {
            'parent_coin_info': 'ab7c7ec8f5b676dcc32020b9b5142f00db6d49e9a55c9df5b76f541c7eb7c60c',
            'puzzle_hash': '302a133f2ae945154a1d657af6fa8c976794aa4c6c95e6e5a5aba72c68b06252',
            'amount': 2000
          },
          'puzzle_reveal': 'ff02ffff01ff02ffff01ff02ffff03ff0bffff01ff02ffff03ffff09ff05ffff1dff0bffff1effff0bff0bffff02ff06ffff04ff02ffff04ff17ff8080808080808080ffff01ff02ff17ff2f80ffff01ff088080ff0180ffff01ff04ffff04ff04ffff04ff05ffff04ffff02ff06ffff04ff02ffff04ff17ff80808080ff80808080ffff02ff17ff2f808080ff0180ffff04ffff01ff32ff02ffff03ffff07ff0580ffff01ff0bffff0102ffff02ff06ffff04ff02ffff04ff09ff80808080ffff02ff06ffff04ff02ffff04ff0dff8080808080ffff01ff0bffff0101ff058080ff0180ff018080ffff04ffff01b0931da5c511ac835cc96e76e1e03e4b3fc30808e4dafe0015c9bbe7afd5bfb138db8d18905edaaa77d69e5d581459932aff018080',
          'solution': 'ff80ffff01ffff33ffa0302a133f2ae945154a1d657af6fa8c976794aa4c6c95e6e5a5aba72c68b06252ff8203e88080ff8080'
        }
      ]
    }
  }
})

provider.request({
  method: 'signMessage',
  params: {
    message: '68656c6c6f2063686961', // "hello chia"
    address: '302a133f2ae945154a1d657af6fa8c976794aa4c6c95e6e5a5aba72c68b06252',
  }
}).then((resp) => {
  const expectResp = {
    signature: '8ee997eb62ad11a9b781d123862d3fe9cfb65a7862c1e0a86618c739119d636a85722e87bdbc3da4cd5a1676dc3836c617a2b176e91dd7b8f8d126fbec509d751e2f811db009a01d0a4438b3c2eaf99b51b76d805700405564b9fc7b52a29625',
    publicKey: '858024f64b04a9abc6622a61e2c823b78a43d219c502719d12a78fd6cad5daa31f80254b1803689a9433960c609f9b92'
  }
})

provider.requst({
  method: 'pushTransaction',
  params: {
    spendBundle: {
      'aggregated_signature': '8fbfaed731345ad21a47165930a191df40c36aeae4d3fcd7ca79e4a5e54b0c588ea6bc683453bbd2a770d2bf46c0563a14d509e233c825198680e3b25afceb7a64be50782102ace7dd872855eb0061bc60626eae0094d9cdbd8a99ad3d2b5dde',
      'coin_solutions': [
        {
          'coin': {
            'parent_coin_info': 'ab7c7ec8f5b676dcc32020b9b5142f00db6d49e9a55c9df5b76f541c7eb7c60c',
            'puzzle_hash': '302a133f2ae945154a1d657af6fa8c976794aa4c6c95e6e5a5aba72c68b06252',
            'amount': 2000
          },
          'puzzle_reveal': 'ff02ffff01ff02ffff01ff02ffff03ff0bffff01ff02ffff03ffff09ff05ffff1dff0bffff1effff0bff0bffff02ff06ffff04ff02ffff04ff17ff8080808080808080ffff01ff02ff17ff2f80ffff01ff088080ff0180ffff01ff04ffff04ff04ffff04ff05ffff04ffff02ff06ffff04ff02ffff04ff17ff80808080ff80808080ffff02ff17ff2f808080ff0180ffff04ffff01ff32ff02ffff03ffff07ff0580ffff01ff0bffff0102ffff02ff06ffff04ff02ffff04ff09ff80808080ffff02ff06ffff04ff02ffff04ff0dff8080808080ffff01ff0bffff0101ff058080ff0180ff018080ffff04ffff01b0931da5c511ac835cc96e76e1e03e4b3fc30808e4dafe0015c9bbe7afd5bfb138db8d18905edaaa77d69e5d581459932aff018080',
          'solution': 'ff80ffff01ffff33ffa0302a133f2ae945154a1d657af6fa8c976794aa4c6c95e6e5a5aba72c68b06252ff8203e88080ff8080'
        }
      ]
    }
  }
}).then((resp) => {
  const expectResp = {
    status: 'success'
  }
})
