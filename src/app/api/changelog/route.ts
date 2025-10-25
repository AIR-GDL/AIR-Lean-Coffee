import { NextResponse } from 'next/server';
import path from 'path';
import { readFile } from 'fs/promises';
import { parseChangelogMarkdown } from '@/lib/changelog-parser';

export async function GET() {
  try {
    const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
    const fileContents = await readFile(changelogPath, 'utf-8');
    const entries = parseChangelogMarkdown(fileContents);

    return NextResponse.json({ data: entries });
  } catch (error) {
    console.error('Failed to read changelog:', error);
    return NextResponse.json(
      { error: 'Failed to load changelog' },
      { status: 500 }
    );
  }
}
