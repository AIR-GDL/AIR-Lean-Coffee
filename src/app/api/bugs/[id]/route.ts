import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

const bugReportSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  severity: { type: String, enum: ['low', 'medium', 'high'], required: true },
  timestamp: { type: String },
  userAgent: { type: String },
  status: { type: String, enum: ['open', 'in-progress', 'resolved'], default: 'open' },
  createdAt: { type: Date, default: Date.now },
});

const BugReport = mongoose.models.BugReport || mongoose.model('BugReport', bugReportSchema);

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.description || !body.severity || !body.status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate enums
    if (!['low', 'medium', 'high'].includes(body.severity)) {
      return NextResponse.json(
        { error: 'Invalid severity level' },
        { status: 400 }
      );
    }

    if (!['open', 'in-progress', 'resolved'].includes(body.status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const updatedBug = await BugReport.findByIdAndUpdate(
      id,
      {
        title: body.title.trim(),
        description: body.description.trim(),
        severity: body.severity,
        status: body.status,
      },
      { new: true }
    );

    if (!updatedBug) {
      return NextResponse.json(
        { error: 'Bug report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        data: updatedBug,
        message: 'Bug report updated successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating bug report:', error);
    return NextResponse.json(
      { error: 'Failed to update bug report' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;

    const deletedBug = await BugReport.findByIdAndDelete(id);

    if (!deletedBug) {
      return NextResponse.json(
        { error: 'Bug report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Bug report deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting bug report:', error);
    return NextResponse.json(
      { error: 'Failed to delete bug report' },
      { status: 500 }
    );
  }
}
