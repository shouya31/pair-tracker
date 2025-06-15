import { Team } from '../../../domain/team/Team';
import { UserDTO } from '../../user/dto/UserDTO';

export class PairDTO {
  constructor(
    public readonly id: string,
    public readonly label: string,
    public readonly members: UserDTO[],
  ) {}
}

export class TeamDTO {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly members: UserDTO[],
    public readonly pairs: PairDTO[],
  ) {}

  static fromDomain(team: Team): TeamDTO {
    return new TeamDTO(
      team.getId(),
      team.getName().getValue(),
      team.getMembers().map(member => UserDTO.fromDomain(member)),
      team.getPairs().map(pair => new PairDTO(
        pair.getId(),
        pair.getLabel().getValue(),
        pair.getMembers().map(member => UserDTO.fromDomain(member)),
      )),
    );
  }
} 