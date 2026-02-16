'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import { Topic } from '@/types';
import { fetchDiscussionHistory } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { BarChart3, Clock, MessageSquare, Users, TrendingUp } from 'lucide-react';

interface MonthlyData {
  month: string;
  count: number;
}

interface AuthorData {
  author: string;
  count: number;
}

interface VoteDistribution {
  range: string;
  count: number;
}

export default function ReportsView() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const topicsPerMonthRef = useRef<SVGSVGElement>(null);
  const topAuthorRef = useRef<SVGSVGElement>(null);
  const voteDistRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await fetchDiscussionHistory();
      setTopics(data);
    } catch (error) {
      console.error('Failed to load discussion data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMonthlyData = useCallback((): MonthlyData[] => {
    const monthMap = new Map<string, number>();
    topics.forEach((t) => {
      const date = new Date(t.discussedAt || t.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthMap.set(key, (monthMap.get(key) || 0) + 1);
    });
    return Array.from(monthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, count]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        count,
      }));
  }, [topics]);

  const getTopAuthors = useCallback((): AuthorData[] => {
    const authorMap = new Map<string, number>();
    topics.forEach((t) => {
      authorMap.set(t.author, (authorMap.get(t.author) || 0) + 1);
    });
    return Array.from(authorMap.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([author, count]) => ({ author, count }));
  }, [topics]);

  const getVoteDistribution = useCallback((): VoteDistribution[] => {
    const ranges = [
      { range: '0', min: 0, max: 0 },
      { range: '1', min: 1, max: 1 },
      { range: '2', min: 2, max: 2 },
      { range: '3', min: 3, max: 3 },
      { range: '4', min: 4, max: 4 },
      { range: '5+', min: 5, max: Infinity },
    ];
    return ranges.map(({ range, min, max }) => ({
      range,
      count: topics.filter((t) => t.votes >= min && t.votes <= max).length,
    }));
  }, [topics]);

  // Topics per month bar chart
  useEffect(() => {
    if (!topicsPerMonthRef.current || topics.length === 0) return;
    const data = getMonthlyData();
    const svg = d3.select(topicsPerMonthRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
    const width = 500 - margin.left - margin.right;
    const height = 260 - margin.top - margin.bottom;

    const g = svg
      .attr('viewBox', `0 0 500 260`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand().domain(data.map((d) => d.month)).range([0, width]).padding(0.3);
    const y = d3.scaleLinear().domain([0, d3.max(data, (d) => d.count) || 1]).nice().range([height, 0]);

    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('font-size', '10px')
      .attr('transform', 'rotate(-30)')
      .attr('text-anchor', 'end');

    g.append('g').call(d3.axisLeft(y).ticks(5)).selectAll('text').attr('font-size', '10px');

    g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (d) => x(d.month) || 0)
      .attr('y', (d) => y(d.count))
      .attr('width', x.bandwidth())
      .attr('height', (d) => height - y(d.count))
      .attr('fill', '#005596')
      .attr('rx', 4);

    g.selectAll('.label')
      .data(data)
      .enter()
      .append('text')
      .attr('x', (d) => (x(d.month) || 0) + x.bandwidth() / 2)
      .attr('y', (d) => y(d.count) - 5)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('fill', '#64748b')
      .text((d) => d.count);
  }, [topics, getMonthlyData]);

  // Top authors horizontal bar chart
  useEffect(() => {
    if (!topAuthorRef.current || topics.length === 0) return;
    const data = getTopAuthors();
    const svg = d3.select(topAuthorRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 10, right: 40, bottom: 10, left: 120 };
    const width = 500 - margin.left - margin.right;
    const height = 260 - margin.top - margin.bottom;

    const g = svg
      .attr('viewBox', `0 0 500 260`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const y = d3.scaleBand().domain(data.map((d) => d.author)).range([0, height]).padding(0.3);
    const x = d3.scaleLinear().domain([0, d3.max(data, (d) => d.count) || 1]).nice().range([0, width]);

    g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', 0)
      .attr('y', (d) => y(d.author) || 0)
      .attr('width', (d) => x(d.count))
      .attr('height', y.bandwidth())
      .attr('fill', '#0ea5e9')
      .attr('rx', 4);

    g.selectAll('.author-label')
      .data(data)
      .enter()
      .append('text')
      .attr('x', -8)
      .attr('y', (d) => (y(d.author) || 0) + y.bandwidth() / 2)
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', '11px')
      .attr('fill', '#334155')
      .text((d) => d.author.length > 16 ? d.author.slice(0, 16) + '…' : d.author);

    g.selectAll('.count-label')
      .data(data)
      .enter()
      .append('text')
      .attr('x', (d) => x(d.count) + 6)
      .attr('y', (d) => (y(d.author) || 0) + y.bandwidth() / 2)
      .attr('dominant-baseline', 'middle')
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .attr('fill', '#005596')
      .text((d) => d.count);
  }, [topics, getTopAuthors]);

  // Vote distribution bar chart
  useEffect(() => {
    if (!voteDistRef.current || topics.length === 0) return;
    const data = getVoteDistribution();
    const svg = d3.select(voteDistRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
    const width = 500 - margin.left - margin.right;
    const height = 260 - margin.top - margin.bottom;

    const g = svg
      .attr('viewBox', `0 0 500 260`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand().domain(data.map((d) => d.range)).range([0, width]).padding(0.3);
    const y = d3.scaleLinear().domain([0, d3.max(data, (d) => d.count) || 1]).nice().range([height, 0]);

    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('font-size', '11px');

    g.append('g').call(d3.axisLeft(y).ticks(5)).selectAll('text').attr('font-size', '10px');

    g.append('text')
      .attr('x', width / 2)
      .attr('y', height + 35)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('fill', '#64748b')
      .text('Votes');

    const colorScale = d3.scaleOrdinal<string>()
      .domain(data.map((d) => d.range))
      .range(['#94a3b8', '#0ea5e9', '#005596', '#7c3aed', '#c026d3', '#e11d48']);

    g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (d) => x(d.range) || 0)
      .attr('y', (d) => y(d.count))
      .attr('width', x.bandwidth())
      .attr('height', (d) => height - y(d.count))
      .attr('fill', (d) => colorScale(d.range))
      .attr('rx', 4);

    g.selectAll('.label')
      .data(data)
      .enter()
      .append('text')
      .attr('x', (d) => (x(d.range) || 0) + x.bandwidth() / 2)
      .attr('y', (d) => y(d.count) - 5)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('fill', '#64748b')
      .text((d) => d.count || '');
  }, [topics, getVoteDistribution]);

  const totalDiscussions = topics.length;
  const totalVotes = topics.reduce((sum, t) => sum + t.votes, 0);
  const avgVotes = totalDiscussions > 0 ? (totalVotes / totalDiscussions).toFixed(1) : '0';
  const uniqueAuthors = new Set(topics.map((t) => t.author)).size;
  const avgDiscTime = totalDiscussions > 0
    ? Math.round(topics.reduce((sum, t) => sum + (t.totalTimeDiscussed || 0), 0) / totalDiscussions / 60)
    : 0;

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      <header className="flex-shrink-0 bg-background sticky top-0 flex h-14 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">Reports</h1>
      </header>

      <main className="flex-1 overflow-auto min-h-0 p-4">
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-xl font-semibold text-muted-foreground">Loading reports...</div>
          </div>
        )}

        {!isLoading && topics.length === 0 && (
          <Card className="p-12 text-center">
            <CardContent className="p-0">
              <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-foreground mb-2">No data yet</h2>
              <p className="text-muted-foreground">Discussion data will appear here once topics are discussed</p>
            </CardContent>
          </Card>
        )}

        {!isLoading && topics.length > 0 && (
          <div className="max-w-5xl mx-auto space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#005596]/10">
                    <MessageSquare className="h-5 w-5 text-[#005596]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{totalDiscussions}</p>
                    <p className="text-xs text-muted-foreground">Discussions</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-sky-500/10">
                    <TrendingUp className="h-5 w-5 text-sky-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{avgVotes}</p>
                    <p className="text-xs text-muted-foreground">Avg Votes</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-violet-500/10">
                    <Users className="h-5 w-5 text-violet-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{uniqueAuthors}</p>
                    <p className="text-xs text-muted-foreground">Contributors</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <Clock className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{avgDiscTime}m</p>
                    <p className="text-xs text-muted-foreground">Avg Discussion</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-4">Discussions per Month</h3>
                  <svg ref={topicsPerMonthRef} className="w-full" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-4">Top Contributors</h3>
                  <svg ref={topAuthorRef} className="w-full" />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">Vote Distribution</h3>
                <div className="max-w-xl mx-auto">
                  <svg ref={voteDistRef} className="w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
