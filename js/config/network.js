import { DE48expand, expandDE48Mastercard } from '../network/master.js';
import { 
    expandDE48Visa,
    expandDE54Visa,
    expandDE55Visa,
    expandDE60Visa,
    expandDE62Visa,
    expandDE63Visa,
    expandDE104Visa,
    expandDE123Visa,
    expandDE125Visa,
    expandDE127Visa,
}  from '../network/visa.js';

// Configuração dos Data Elements
export const VISA_FIELD_MAP = {
  48: { parser: expandDE48Visa },
  54: { parser: expandDE54Visa },
  55: { parser: expandDE55Visa },
  60: { parser: expandDE60Visa },
  62: { parser: expandDE62Visa },
  63: { parser: expandDE63Visa },
  104: { parser: expandDE104Visa },
  123: { parser: expandDE123Visa },
  125: { parser: expandDE125Visa },  
  127: { parser: expandDE127Visa }

};

export const MC_FIELD_MAP = {
    48: { parser: expandDE48Mastercard },
};

export const ELO_FIELD_MAP = {
    48: { parser: expandDE48Visa },
};

export const NETWORK_CONFIG = {
    visa: {
        headerLength: 22,
        mtiBytes: 2,
        fieldMap: VISA_FIELD_MAP
    },
    mastercard: {
        headerLength: 0,
        mtiBytes: 4,
        fieldMap: MC_FIELD_MAP
    },
    elo: {
        headerLength: 0,
        mtiBytes: 4,
        fieldMap: ELO_FIELD_MAP
    }
};

export const NETWORK_OVERRIDES = {

  visa: {
    48: { parser: expandDE48Visa },
    54: { parser: expandDE54Visa },
    55: { parser: expandDE55Visa },
    60: { parser: expandDE60Visa },
    62: { parser: expandDE62Visa },
    63: { parser: expandDE63Visa },
    104: { parser: expandDE104Visa },
    123: { parser: expandDE123Visa },
    125: { parser: expandDE125Visa },
    127: { parser: expandDE127Visa }
  },

  mastercard: {
    //48: { parser: expandDE48Mastercard },
    48: { parser: expandDE48Mastercard },
  },

  elo: {
    48: { parser: expandDE48Visa },
  }

};

