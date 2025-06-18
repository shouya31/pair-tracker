export class DuplicateTeamNameError extends Error {
  constructor(teamName: string) {
    super(`チーム名 "${teamName}" は既に使用されています`);
    this.name = 'DuplicateTeamNameError';
  }
} 