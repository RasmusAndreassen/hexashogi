import { Color } from './types';
import { PieceKey } from './pieces';
const initial:{[q:number]: {
      [r:number]: {
      piece: PieceKey,
      color: Color,
      }
    }
    } = {
    [-4]: {
      [-1]: {
        piece: 'p',
        color: Color.black,
      },
      5: {
        piece: 'p',
        color: Color.white,
      }
    },
    [-3]: {
      [-2]: {
        piece: 'r',
        color: Color.black
      },
      [-1]: {
        piece: 'p',
        color: Color.black,
      },
      4: {
        piece: 'p',
        color: Color.white,
      },
      5: {
        piece: 'r',
        color: Color.white
      }
    },
    [-2]: {
      [-3]: {
        piece: 'k',
        color: Color.black
      },
      [-1]: {
        piece: 'p',
        color: Color.black,
      },
      3: {
        piece: 'p',
        color: Color.white,
      },
      5: {
        piece: 'k',
        color: Color.white,
      },
    },
    [-1]: {
      [-4]: {
        piece: 'Q',
        color: Color.black
      },
      [-1]: {
        piece: 'p',
        color: Color.black,
      },
      2: {
        piece: 'p',
        color: Color.white,
      },
      5: {
        piece: 'Q',
        color: Color.white,
      }
    },
    0: {
      [-5]: {
        piece: 'b',
        color: Color.black,
      },
      [-4]: {
        piece: 'b',
        color: Color.black,
      },
      [-3]:{
        piece: 'b',
        color: Color.black,
      },
      [-1]: {
        piece: 'p',
        color: Color.black,
      },
      1: {
        piece: 'p',
        color: Color.white,
      },
      3: {
        piece: 'b',
        color: Color.white,
      },
      4: {
        piece: 'b',
        color: Color.white,
      },
      5: {
        piece: 'b',
        color: Color.white,
      }
    },
    1: {
      [-5]: {
        piece: 'K',
        color: Color.black
      },
      [-2]: {
        piece: 'p',
        color: Color.black,
      },
      1: {
        piece: 'p',
        color: Color.white,
      },
      4: {
        piece: 'K',
        color: Color.white,
      }
    },
    2: {
      [-5]: {
        piece: 'k',
        color: Color.black
      },
      [-3]: {
        piece: 'p',
        color: Color.black,
      },
      1: {
        piece: 'p',
        color: Color.white,
      },
      3: {
        piece: 'k',
        color: Color.white,
      }
    },
    3: {
      [-5]: {
        piece: 'r',
        color: Color.black
      },
      [-4]: {
        piece: 'p',
        color: Color.black,
      },
      1: {
        piece: 'p',
        color: Color.white,
      },
      2: {
        piece: 'r',
        color: Color.white,
      }
    },
    4: {
      [-5]: {
        piece: 'p',
        color: Color.black,
      },
      1: {
        piece: 'p',
        color: Color.white,
      }
    }
  }

export default initial;