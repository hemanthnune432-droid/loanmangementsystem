import DashboardLayout from './DashboardLayout';
import { useData } from '../context/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, Users, AlertTriangle, Activity, FileText } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

export default function AnalystDashboard() {
  const { loans, payments } = useData();

  // Calculate key metrics
  const totalLoanValue = loans.reduce((sum, loan) => sum + loan.amount, 0);
  const totalPaid = loans.reduce((sum, loan) => sum + loan.paidAmount, 0);
  const activeLoans = loans.filter(l => l.status === 'active');
  const completedLoans = loans.filter(l => l.status === 'completed');
  const defaultedLoans = loans.filter(l => l.status === 'rejected');
  
  const totalOutstanding = activeLoans.reduce((sum, loan) => 
    sum + (loan.totalPayable - loan.paidAmount), 0
  );
  
  const averageInterestRate = loans.length > 0 
    ? loans.reduce((sum, loan) => sum + loan.interestRate, 0) / loans.length 
    : 0;

  const repaymentRate = totalLoanValue > 0 ? (totalPaid / totalLoanValue) * 100 : 0;

  // Loan status distribution
  const loanStatusData = [
    { name: 'Active', value: activeLoans.length, color: '#10b981' },
    { name: 'Completed', value: completedLoans.length, color: '#3b82f6' },
    { name: 'Pending', value: loans.filter(l => l.status === 'pending').length, color: '#f59e0b' },
    { name: 'Rejected', value: defaultedLoans.length, color: '#ef4444' },
  ];

  // Monthly disbursement trend (mock data for demonstration)
  const monthlyData = [
    { month: 'Jan', disbursed: 45000, collected: 32000 },
    { month: 'Feb', disbursed: 52000, collected: 38000 },
    { month: 'Mar', disbursed: 48000, collected: 42000 },
    { month: 'Apr', disbursed: 61000, collected: 47000 },
    { month: 'May', disbursed: 55000, collected: 51000 },
    { month: 'Jun', disbursed: 58000, collected: 54000 },
  ];

  // Interest rate distribution
  const interestRateData = [
    { range: '0-5%', count: loans.filter(l => l.interestRate < 5).length },
    { range: '5-10%', count: loans.filter(l => l.interestRate >= 5 && l.interestRate < 10).length },
    { range: '10-15%', count: loans.filter(l => l.interestRate >= 10 && l.interestRate < 15).length },
    { range: '15%+', count: loans.filter(l => l.interestRate >= 15).length },
  ];

  // Risk analysis - loans with high outstanding amounts
  const highRiskLoans = activeLoans
    .filter(loan => {
      const remaining = loan.totalPayable - loan.paidAmount;
      const progress = (loan.paidAmount / loan.totalPayable) * 100;
      return remaining > 5000 && progress < 30;
    })
    .sort((a, b) => (b.totalPayable - b.paidAmount) - (a.totalPayable - a.paidAmount))
    .slice(0, 5);

  // Top performing loans
  const topPerformingLoans = activeLoans
    .filter(loan => {
      const progress = (loan.paidAmount / loan.totalPayable) * 100;
      return progress > 50;
    })
    .sort((a, b) => {
      const progressA = (a.paidAmount / a.totalPayable) * 100;
      const progressB = (b.paidAmount / b.totalPayable) * 100;
      return progressB - progressA;
    })
    .slice(0, 5);

  return (
    <DashboardLayout title="Financial Analyst Dashboard">
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Total Portfolio Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">₹{totalLoanValue.toLocaleString('en-IN')}</div>
              <p className="text-xs text-muted-foreground">
                {loans.length} total loans
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Outstanding Amount</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-orange-600">₹{totalOutstanding.toLocaleString('en-IN')}</div>
              <p className="text-xs text-muted-foreground">
                From {activeLoans.length} active loans
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Repayment Rate</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-green-600">{repaymentRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                ₹{totalPaid.toLocaleString('en-IN')} collected
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Avg. Interest Rate</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{averageInterestRate.toFixed(2)}%</div>
              <p className="text-xs text-muted-foreground">
                Across all loans
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="reports">Detailed Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Loan Status Distribution</CardTitle>
                  <CardDescription>Breakdown of loans by status</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={loanStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {loanStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Interest Rate Distribution</CardTitle>
                  <CardDescription>Number of loans by interest rate range</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={interestRateData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Disbursement vs Collection Trend</CardTitle>
                <CardDescription>Track loan disbursements and collections over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="disbursed" stroke="#8b5cf6" strokeWidth={2} name="Disbursed" />
                    <Line type="monotone" dataKey="collected" stroke="#10b981" strokeWidth={2} name="Collected" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="risk" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>High Risk Loans</CardTitle>
                <CardDescription>Loans with high outstanding amounts and low repayment progress</CardDescription>
              </CardHeader>
              <CardContent>
                {highRiskLoans.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No high-risk loans identified</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Loan ID</TableHead>
                        <TableHead>Borrower</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Outstanding</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Risk Level</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {highRiskLoans.map((loan) => {
                        const outstanding = loan.totalPayable - loan.paidAmount;
                        const progress = (loan.paidAmount / loan.totalPayable) * 100;
                        return (
                          <TableRow key={loan.id}>
                            <TableCell>#{loan.id.slice(-6)}</TableCell>
                            <TableCell>{loan.borrowerName}</TableCell>
                            <TableCell>₹{loan.amount.toLocaleString('en-IN')}</TableCell>
                            <TableCell className="text-orange-600">₹{outstanding.toLocaleString('en-IN')}</TableCell>
                            <TableCell>{progress.toFixed(1)}%</TableCell>
                            <TableCell>
                              <Badge variant="destructive">High</Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Default Rate</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl text-red-600">
                    {loans.length > 0 ? ((defaultedLoans.length / loans.length) * 100).toFixed(1) : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {defaultedLoans.length} defaulted loans
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Active Risk Exposure</CardTitle>
                  <DollarSign className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl text-orange-600">
                    ${(totalOutstanding / 1000).toFixed(0)}K
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total outstanding
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Portfolio Health</CardTitle>
                  <Activity className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl text-green-600">
                    {repaymentRate > 70 ? 'Good' : repaymentRate > 50 ? 'Fair' : 'Poor'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Based on repayment rate
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Loans</CardTitle>
                <CardDescription>Loans with highest repayment progress</CardDescription>
              </CardHeader>
              <CardContent>
                {topPerformingLoans.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No performing loans data available</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Loan ID</TableHead>
                        <TableHead>Borrower</TableHead>
                        <TableHead>Lender</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Paid</TableHead>
                        <TableHead>Progress</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topPerformingLoans.map((loan) => {
                        const progress = (loan.paidAmount / loan.totalPayable) * 100;
                        return (
                          <TableRow key={loan.id}>
                            <TableCell>#{loan.id.slice(-6)}</TableCell>
                            <TableCell>{loan.borrowerName}</TableCell>
                            <TableCell>{loan.lenderName}</TableCell>
                            <TableCell>₹{loan.amount.toLocaleString('en-IN')}</TableCell>
                            <TableCell className="text-green-600">₹{loan.paidAmount.toLocaleString('en-IN')}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-green-600 h-2 rounded-full"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                                <span className="text-sm">{progress.toFixed(0)}%</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Completion Rate</CardTitle>
                  <CardDescription>Percentage of successfully completed loans</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl text-center text-green-600 mb-2">
                    {loans.length > 0 ? ((completedLoans.length / loans.length) * 100).toFixed(1) : 0}%
                  </div>
                  <p className="text-center text-sm text-gray-600">
                    {completedLoans.length} out of {loans.length} loans completed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Average Loan Size</CardTitle>
                  <CardDescription>Mean loan amount across portfolio</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl text-center text-blue-600 mb-2">
                    ₹{loans.length > 0 ? (totalLoanValue / loans.length).toLocaleString('en-IN', { maximumFractionDigits: 0 }) : 0}
                  </div>
                  <p className="text-center text-sm text-gray-600">
                    Average across {loans.length} loans
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Loans Report</CardTitle>
                <CardDescription>Complete overview of all loans in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Borrower</TableHead>
                        <TableHead>Lender</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Rate</TableHead>
                        <TableHead>Tenure</TableHead>
                        <TableHead>Paid</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loans.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center text-gray-500">
                            No loans available
                          </TableCell>
                        </TableRow>
                      ) : (
                        loans.map((loan) => (
                          <TableRow key={loan.id}>
                            <TableCell>#{loan.id.slice(-6)}</TableCell>
                            <TableCell>{loan.borrowerName}</TableCell>
                            <TableCell>{loan.lenderName}</TableCell>
                            <TableCell>₹{loan.amount.toLocaleString('en-IN')}</TableCell>
                            <TableCell>{loan.interestRate}%</TableCell>
                            <TableCell>{loan.tenure}m</TableCell>
                            <TableCell>₹{loan.paidAmount.toLocaleString('en-IN')}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  loan.status === 'active' ? 'default' :
                                  loan.status === 'completed' ? 'default' :
                                  loan.status === 'pending' ? 'secondary' :
                                  'destructive'
                                }
                                className={
                                  loan.status === 'active' ? 'bg-green-500' :
                                  loan.status === 'completed' ? 'bg-blue-500' :
                                  ''
                                }
                              >
                                {loan.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Transactions Report</CardTitle>
                <CardDescription>All recorded payment transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Loan ID</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Month</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-gray-500">
                            No payment transactions recorded
                          </TableCell>
                        </TableRow>
                      ) : (
                        payments.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                            <TableCell>#{payment.loanId.slice(-6)}</TableCell>
                            <TableCell>₹{payment.amount.toLocaleString('en-IN')}</TableCell>
                            <TableCell className="capitalize">{payment.type}</TableCell>
                            <TableCell>Month {payment.month}</TableCell>
                            <TableCell>
                              <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                                {payment.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
