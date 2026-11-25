export type FounderGroup = 'oli' | 'walford';

export type PlayerFlair = {
  founder: boolean;
  groups: FounderGroup[];
};

type FlairMember = {
  id: string;
  nickname: string;
  role?: string;
};

function normalizePlayerName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/**
 * Reglas acordadas para la mesa:
 * - Contiene «oli» (incluye Oli358) -> fundador.
 * - Contiene «abril», «walfoord» o «walford» -> fundador.
 * La coincidencia es deliberadamente por subcadena: el usuario pidió que
 * cualquier variación con esos nombres reciba el tratamiento especial.
 */
export function getPlayerFlair(nickname: string): PlayerFlair {
  const normalized = normalizePlayerName(nickname);
  const groups: FounderGroup[] = [];

  if (normalized.includes('oli')) {
    groups.push('oli');
  }

  if (
    normalized.includes('abril') ||
    normalized.includes('walfoord') ||
    normalized.includes('walford')
  ) {
    groups.push('walford');
  }

  return { founder: groups.length > 0, groups };
}

/**
 * El aura de corazones solo aparece cuando hay al menos dos personas
 * distintas: una del grupo Oli y otra del grupo Walford/Abril. Dos Olis
 * (o dos Abriles/Walfords) no bastan.
 */
export function hasFounderDuo(members: ReadonlyArray<FlairMember>): boolean {
  const humans = members.filter(
    (member) => member.role !== 'bot' && member.role !== 'spectator',
  );
  if (humans.length < 2) return false;

  const oliMembers = humans.filter((member) => getPlayerFlair(member.nickname).groups.includes('oli'));
  const walfordMembers = humans.filter((member) =>
    getPlayerFlair(member.nickname).groups.includes('walford'),
  );

  return oliMembers.some((oli) =>
    walfordMembers.some((walford) => walford.id !== oli.id),
  );
}
