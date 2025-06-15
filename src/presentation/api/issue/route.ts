import { NextResponse } from 'next/server';
import { CreateIssueCommand } from '../../../application/issue/commands/CreateIssueCommand';
import { AssignIssueCommand } from '../../../application/issue/commands/AssignIssueCommand';
import { ChangeStatusCommand } from '../../../application/issue/commands/ChangeStatusCommand';
import { CreateIssueUseCase } from '../../../application/issue/usecases/CreateIssueUseCase';
import { AssignIssueUseCase } from '../../../application/issue/usecases/AssignIssueUseCase';
import { ChangeStatusUseCase } from '../../../application/issue/usecases/ChangeStatusUseCase';
import { IssueRepositoryPrisma } from '../../../infrastructure/repositories/IssueRepositoryPrisma';
import { UserRepositoryPrisma } from '../../../infrastructure/repositories/UserRepositoryPrisma';
import { IssueStatus } from '../../../domain/issue/enums/IssueStatus';

const issueRepository = new IssueRepositoryPrisma();
const userRepository = new UserRepositoryPrisma();
const createIssueUseCase = new CreateIssueUseCase(issueRepository, userRepository);
const assignIssueUseCase = new AssignIssueUseCase(issueRepository, userRepository);
const changeStatusUseCase = new ChangeStatusUseCase(issueRepository, userRepository);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const command = new CreateIssueCommand(
      body.title,
      body.creatorId,
    );
    const result = await createIssueUseCase.execute(command);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    
    if (body.type === 'assign') {
      const command = new AssignIssueCommand(
        body.issueId,
        body.assigneeId,
      );
      const result = await assignIssueUseCase.execute(command);
      return NextResponse.json(result);
    }
    
    if (body.type === 'status') {
      const command = new ChangeStatusCommand(
        body.issueId,
        body.userId,
        body.status as IssueStatus,
      );
      const result = await changeStatusUseCase.execute(command);
      return NextResponse.json(result);
    }

    throw new Error('Invalid operation type');
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
} 