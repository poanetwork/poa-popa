#!/usr/bin/env bash
# EthereumJS TestRPC v4.0.1 (ganache-core: 1.0.1)

# Available Accounts
# ==================
# (0) 0x7e7693f12bfd372042b754b729d1474572a2dd01 <-- metamask
# (1) 0xdbde11e51b9fcc9c455de9af89729cf37d835156 <-- owner
# (2) 0xc2cf7af69c250ff59d44b31fd05f331f1f5a84e5
# (3) 0x514f8e01ad28696845da6ce1cce1fd789c780a6d
# (4) 0x139f3074566a93a5ef2eabff37e9066dbda80f19
# (5) 0x29ef6da79eef29a10383fcb6ac26053f0f0ccb3d
# (6) 0x338b03edd92718046849a2677e5a46ac887f8665
# (7) 0xa28e20ff577624edb94fefd112e4cbf2b3c05e66
# (8) 0x6759ad42f3be6e578a949c63bbf5b8f95bc3fc43
# (9) 0x1aa2d288d03d8397c193d2327ee7a7443d4ec3a1

# Private Keys
# ==================
# (0) 68d90a98fc4b8e66a016f66cb8363904a4e521a2480602bd78cc67945676e9cd <-- metamask
# (1) 1dd9083e16e190fa5413f87837025556063c546bf16e38cc53fd5d018a3acfbb <-- owner
# (2) a2fbd494c3031335d595cc5ad89a9c97d3e5a7f6b00d191d91af915b8b039d34
# (3) ed8aa8f379bac1ff5eafc5f792c32b40a5419edf528a37addbfc8ce36c487463
# (4) 81193e26e271a824fda36511b2814e9d47e0c16ebd31304e88c25a6d659286b8
# (5) 6ee2f0da244d4eea41bd2d92eb8af046589956790ca83055d72d6cb3fe425a57
# (6) b66c237da44e8f9d4411fa9b15c6d6e2df81f93bc5f03430895ccb5cc0a6aff9
# (7) 27d7d3598f704da770bb126df3f7b073809ce2ea8cd0d7b75a409e320bf31b05
# (8) 9095ed8f4917235794b9c4fe9438fec29de759916bf216a8aa28f647664a35ff
# (9) ab470a1366c59dec4058af0110d6447addf1bad57965bff5b01059cbd80ac47f

# HD Wallet
# ==================
# Mnemonic:      toddler weather rocket off sentence chat unlock flame organ shuffle treat awful
# Base HD Path:  m/44'/60'/0'/0/{account_index}


ganache-cli \
    -m "toddler weather rocket off sentence chat unlock flame organ shuffle treat awful" \
    #--blocktime 10 \
    --secure \
    --account="0x68d90a98fc4b8e66a016f66cb8363904a4e521a2480602bd78cc67945676e9cd," \
    --account="0x1dd9083e16e190fa5413f87837025556063c546bf16e38cc53fd5d018a3acfbb," \
    --account="0xa2fbd494c3031335d595cc5ad89a9c97d3e5a7f6b00d191d91af915b8b039d34," \
    --account="0xed8aa8f379bac1ff5eafc5f792c32b40a5419edf528a37addbfc8ce36c487463," \
    --account="0x81193e26e271a824fda36511b2814e9d47e0c16ebd31304e88c25a6d659286b8," \
    --account="0x6ee2f0da244d4eea41bd2d92eb8af046589956790ca83055d72d6cb3fe425a57," \
    --unlock "0xdbde11e51b9fcc9c455de9af89729cf37d835156" \
    --networkId 1523897649907
