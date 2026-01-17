export const VVS_ADDRESSES = {
  cronos: {
    router: '0x145863Eb42Cf62847A6Ca784e6416C1682b1b2Ae',
    craftsman: '0xDccd6455AE04b03d785F12196B492b18129564bc',
    vvsToken: '0x2d03bece6747adc00e1a131bba1469c15fd11e03',
    smartRouter: '0x66C0893E38B2a52E1Dc442b2dE75B802CcA49566',
  },
  // Add testnet addresses if available, otherwise use placeholders or mainnet for now
  cronosTestnet: {
    router: '0x145863Eb42Cf62847A6Ca784e6416C1682b1b2Ae', // Placeholder/Same for now if unknown
    craftsman: '0xDccd6455AE04b03d785F12196B492b18129564bc', // Placeholder
    vvsToken: '0x2d03bece6747adc00e1a131bba1469c15fd11e03', // Placeholder
  }
} as const;

export const KNOWN_TOKENS = {
  USDC: '0xc21223249CA28397B4B6541dfFaEcC539BfF0c59', // USDC on Cronos
  WCRO: '0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23', // WCRO on Cronos
} as const;
