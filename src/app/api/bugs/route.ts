import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

const bugReportSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  severity: { type: String, enum: ['low', 'medium', 'high'], required: true },
  timestamp: { type: String },
  userAgent: { type: String },
  userName: { type: String },
  userEmail: { type: String },
  status: { type: String, enum: ['open', 'in-progress', 'resolved'], default: 'open' },
  createdAt: { type: Date, default: Date.now },
});

const BugReport = mongoose.models.BugReport || mongoose.model('BugReport', bugReportSchema);

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.description || !body.severity) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, severity' },
        { status: 400 }
      );
    }

    // Validate severity
    if (!['low', 'medium', 'high'].includes(body.severity)) {
      return NextResponse.json(
        { error: 'Invalid severity level' },
        { status: 400 }
      );
    }

    const bugReport = new BugReport({
      title: body.title.trim(),
      description: body.description.trim(),
      severity: body.severity,
      timestamp: body.timestamp || new Date().toISOString(),
      userAgent: body.userAgent || '',
      userName: body.userName || '',
      userEmail: body.userEmail || '',
      status: 'open',
    });

    const savedReport = await bugReport.save();

    return NextResponse.json(
      {
        data: savedReport,
        message: 'Bug report submitted successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error submitting bug report:', error);
    return NextResponse.json(
      { error: 'Failed to submit bug report' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();

    const bugs = await BugReport.find({})
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json(
      {
        data: bugs,
        message: 'Bug reports retrieved successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error retrieving bug reports:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve bug reports' },
      { status: 500 }
    );
  }
}
