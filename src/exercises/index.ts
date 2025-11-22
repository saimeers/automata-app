import { PushdownAutomaton } from '../core/PushdownAutomaton';
import { PDA2 } from './PDA2';
import { PDA3 } from './PDA3';
import { PDA4 } from './PDA4';
import { PDA5 } from './PDA5';

export const EXERCISES = {
    1: {
        description: 'L = { 0ⁿ 1ᵐ 0ⁿ }',
        example: '0,0,0,1,1,0,0,0',
        strategy: [
            'Push X por cada 0 inicial',
            'Leer 1s sin modificar pila',
            'Pop X por cada 0 final',
            'Aceptar si pila vuelve a Z'
        ]
    },
    2: {
        description: 'L = { (1ⁿ 2ᵐ)ᵏ } con n par, m=n/2, k=n',
        example: '1,1,2,1,1,2',
        strategy: [
            '4 pilas: X (k), Y (m), B/C (alternan n)',
            'Push 2X por par de 1s',
            'Consumir X al leer siguiente grupo',
            'Verificar m=n/2 con Y'
        ]
    },
    3: {
        description: 'L = { 0ⁿ 1ᵐ 2ᵏ } con m=n, k=m+n',
        example: '0,0,1,1,2,2,2,2',
        strategy: [
            '2 pilas: X (n), Y (m+n)',
            'Push X y Y por cada 0',
            'Pop X y push Y por cada 1 (m=n)',
            'Pop Y por cada 2 (k=m+n=2n)'
        ]
    },
    4: {
        description: 'L = { aⁿbᵐcᵏ } con n≥1, m=2n, k=3n',
        example: 'a,a,b,b,b,b,c,c,c,c,c,c',
        strategy: [
            '3 pilas: X (n), Y (m=2n), W (k=3n)',
            'Por cada a: push X, push YY, push WWW',
            'Por cada b: pop Y (verifica m=2n)',
            'Por cada c: pop W (verifica k=3n)'
        ]
    }
};

export function createPDA(n: number): PushdownAutomaton {
    switch (n) {
        case 1: return new PDA2();
        case 2: return new PDA3();
        case 3: return new PDA4();
        case 4: return new PDA5();
        default: return new PDA2();
    }
}