import { describe, expect, it } from 'vitest';
import { getPlayerFlair, hasFounderDuo } from './playerFlair';

describe('playerFlair', () => {
  it('reconoce al grupo Oli sin distinguir mayúsculas', () => {
    expect(getPlayerFlair('Oli').groups).toContain('oli');
    expect(getPlayerFlair('OLI358').groups).toContain('oli');
    expect(getPlayerFlair('la oli').groups).toContain('oli');
    expect(getPlayerFlair('Olivia').groups).toContain('oli');
  });

  it('reconoce Abril y las variantes de Walford', () => {
    expect(getPlayerFlair('Abril').groups).toContain('walford');
    expect(getPlayerFlair('ÁBRIL').groups).toContain('walford');
    expect(getPlayerFlair('Walfoord').groups).toContain('walford');
    expect(getPlayerFlair('walford').groups).toContain('walford');
  });

  it('deja al resto de nombres sin trato especial', () => {
    expect(getPlayerFlair('Ana')).toEqual({ founder: false, groups: [] });
    expect(getPlayerFlair('Cafetero')).toEqual({ founder: false, groups: [] });
  });

  it('activa el aura solo con una persona de cada grupo', () => {
    expect(
      hasFounderDuo([
        { id: '1', nickname: 'Oli' },
        { id: '2', nickname: 'Abril' },
      ]),
    ).toBe(true);
    expect(
      hasFounderDuo([
        { id: '1', nickname: 'Oli358' },
        { id: '2', nickname: 'Walfoord' },
        { id: '3', nickname: 'Cafetero' },
      ]),
    ).toBe(true);
  });

  it('no activa el aura con dos nombres del mismo grupo', () => {
    expect(
      hasFounderDuo([
        { id: '1', nickname: 'Oli' },
        { id: '2', nickname: 'Oli358' },
      ]),
    ).toBe(false);
    expect(
      hasFounderDuo([
        { id: '1', nickname: 'Abril' },
        { id: '2', nickname: 'Walford' },
      ]),
    ).toBe(false);
  });

  it('exige dos personas distintas y excluye bots y espectadores', () => {
    expect(hasFounderDuo([{ id: '1', nickname: 'Oli Abril' }])).toBe(false);
    expect(
      hasFounderDuo([
        { id: '1', nickname: 'Oli' },
        { id: '2', nickname: 'Abril', role: 'bot' },
      ]),
    ).toBe(false);
    expect(
      hasFounderDuo([
        { id: '1', nickname: 'Oli' },
        { id: '2', nickname: 'Abril', role: 'spectator' },
      ]),
    ).toBe(false);
  });
});
