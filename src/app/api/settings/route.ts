import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import AppSettings from '@/models/AppSettings';

interface AppSettingsData {
  votesPerUser: number;
  minDiscussionMinutes: number;
  maxDiscussionMinutes: number;
  hideArchivedTopics: boolean;
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get global settings (there should be only one document)
    const settings = await AppSettings.findOne({});

    if (!settings) {
      // Return default settings
      const defaultSettings: AppSettingsData = {
        votesPerUser: 3,
        minDiscussionMinutes: 1,
        maxDiscussionMinutes: 10,
        hideArchivedTopics: false,
      };
      return NextResponse.json(defaultSettings);
    }

    // Convert to plain object and remove MongoDB fields
    const settingsData = {
      votesPerUser: settings.votesPerUser,
      minDiscussionMinutes: settings.minDiscussionMinutes,
      maxDiscussionMinutes: settings.maxDiscussionMinutes,
      hideArchivedTopics: settings.hideArchivedTopics,
    };

    return NextResponse.json(settingsData);
  } catch (error) {
    console.error('Failed to fetch app settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const settingsData: AppSettingsData = await request.json();

    // Validate settings
    if (
      typeof settingsData.votesPerUser !== 'number' ||
      typeof settingsData.minDiscussionMinutes !== 'number' ||
      typeof settingsData.maxDiscussionMinutes !== 'number' ||
      typeof settingsData.hideArchivedTopics !== 'boolean' ||
      settingsData.votesPerUser < 1 ||
      settingsData.votesPerUser > 10 ||
      settingsData.minDiscussionMinutes < 1 ||
      settingsData.maxDiscussionMinutes > 60 ||
      settingsData.minDiscussionMinutes >= settingsData.maxDiscussionMinutes
    ) {
      return NextResponse.json(
        { error: 'Invalid settings data' },
        { status: 400 }
      );
    }

    // Find existing settings or create new one
    let settings = await AppSettings.findOne({});

    if (settings) {
      // Update existing settings
      settings.votesPerUser = settingsData.votesPerUser;
      settings.minDiscussionMinutes = settingsData.minDiscussionMinutes;
      settings.maxDiscussionMinutes = settingsData.maxDiscussionMinutes;
      settings.hideArchivedTopics = settingsData.hideArchivedTopics;
      await settings.save();
    } else {
      // Create new settings document
      settings = await AppSettings.create(settingsData);
    }

    return NextResponse.json({ message: 'Settings saved successfully' });
  } catch (error) {
    console.error('Failed to save app settings:', error);
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}
