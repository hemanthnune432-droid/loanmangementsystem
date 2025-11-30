import { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Users, FileText, CheckCircle2, XCircle, Clock, DollarSign, TrendingUp } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { loans, updateLoan } = useData();
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    setPendingUsers(users.filter((u: any) => u.status === 'pending'));
    setAllUsers(users);
  }, []);

  const approveUser = (userId: string) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.map((u: any) => 
      u.id === userId ? { ...u, status: 'approved' } : u
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setPendingUsers(updatedUsers.filter((u: any) => u.status === 'pending'));
    setAllUsers(updatedUsers);
  };

  const rejectUser = (userId: string) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.map((u: any) => 
      u.id === userId ? { ...u, status: 'rejected' } : u
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setPendingUsers(updatedUsers.filter((u: any) => u.status === 'pending'));
    setAllUsers(updatedUsers);
  };

  const approveLoan = (loanId: string) => {
    const loan = loans.find(l => l.id === loanId);
    if (loan) {
      const startDate = new Date();
      const nextPaymentDate = new Date(startDate);
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
      
      updateLoan(loanId, {
        status: 'active',
        approvedAt: new Date().toISOString(),
        startDate: startDate.toISOString(),
        nextPaymentDate: nextPaymentDate.toISOString(),
        nextPaymentAmount: loan.monthlyPayment,
      });
    }
  };

  const rejectLoan = (loanId: string) => {
    updateLoan(loanId, { status: 'rejected' });
  };

  const pendingLoans = loans.filter(l => l.status === 'pending');
  const activeLoans = loans.filter(l => l.status === 'active');
  const completedLoans = loans.filter(l => l.status === 'completed');
  
  const totalLoanValue = loans.reduce((sum, loan) => sum + loan.amount, 0);
  const totalPaidAmount = loans.reduce((sum, loan) => sum + loan.paidAmount, 0);

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{allUsers.length}</div>
              <p className="text-xs text-muted-foreground">
                {pendingUsers.length} pending approval
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Total Loans</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{loans.length}</div>
              <p className="text-xs text-muted-foreground">
                {pendingLoans.length} pending approval
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Total Loan Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">₹{totalLoanValue.toLocaleString('en-IN')}</div>
              <p className="text-xs text-muted-foreground">
                Across all loans
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Total Collected</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">₹{totalPaidAmount.toLocaleString('en-IN')}</div>
              <p className="text-xs text-muted-foreground">
                {((totalPaidAmount / totalLoanValue) * 100 || 0).toFixed(1)}% of total
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">
              User Approvals ({pendingUsers.length})
            </TabsTrigger>
            <TabsTrigger value="loans">
              Loan Approvals ({pendingLoans.length})
            </TabsTrigger>
            <TabsTrigger value="active">
              Active Loans ({activeLoans.length})
            </TabsTrigger>
            <TabsTrigger value="all-users">
              All Users ({allUsers.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            {pendingUsers.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-gray-500">No pending user approvals</p>
                </CardContent>
              </Card>
            ) : (
              pendingUsers.map((pendingUser) => (
                <Card key={pendingUser.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{pendingUser.name}</CardTitle>
                        <CardDescription>
                          {pendingUser.email} • {pendingUser.phone}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className="capitalize">
                        {pendingUser.role}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {pendingUser.role === 'lender' && (
                        <>
                          <div>
                            <span className="text-gray-500">Business Name:</span>
                            <p>{pendingUser.businessName}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Business Type:</span>
                            <p>{pendingUser.businessType}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Tax ID:</span>
                            <p>{pendingUser.taxId}</p>
                          </div>
                        </>
                      )}
                      {pendingUser.role === 'borrower' && (
                        <>
                          <div>
                            <span className="text-gray-500">Employment:</span>
                            <p>{pendingUser.employmentStatus}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Monthly Income:</span>
                            <p>${pendingUser.monthlyIncome}</p>
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-500">Address:</span>
                            <p>{pendingUser.address}</p>
                          </div>
                        </>
                      )}
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Submitted Documents:</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(pendingUser.documents || {}).map(([key, value]) => (
                          value && (
                            <Badge key={key} variant="outline">
                              {key}: {value as string}
                            </Badge>
                          )
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => approveUser(pendingUser.id)}
                        className="flex-1"
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => rejectUser(pendingUser.id)}
                        className="flex-1"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="loans" className="space-y-4">
            {pendingLoans.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-gray-500">No pending loan approvals</p>
                </CardContent>
              </Card>
            ) : (
              pendingLoans.map((loan) => (
                <Card key={loan.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>Loan Application #{loan.id.slice(-6)}</CardTitle>
                        <CardDescription>
                          Requested on {new Date(loan.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">Pending</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Lender:</span>
                        <p>{loan.lenderName}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Borrower:</span>
                        <p>{loan.borrowerName}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Surety:</span>
                        <p>{loan.suretyName || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Purpose:</span>
                        <p>{loan.purpose}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Amount:</span>
                        <p className="text-lg">₹{loan.amount.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Interest Rate:</span>
                        <p className="text-lg">{loan.interestRate}%</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Tenure:</span>
                        <p>{loan.tenure} months</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Monthly Payment:</span>
                        <p>₹{loan.monthlyPayment.toLocaleString('en-IN')}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500">Total Payable:</span>
                        <p className="text-lg">₹{loan.totalPayable.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => approveLoan(loan.id)}
                        className="flex-1"
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Approve Loan
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => rejectLoan(loan.id)}
                        className="flex-1"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {activeLoans.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-gray-500">No active loans</p>
                </CardContent>
              </Card>
            ) : (
              activeLoans.map((loan) => (
                <Card key={loan.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>Loan #{loan.id.slice(-6)}</CardTitle>
                        <CardDescription>
                          {loan.borrowerName} • Started {new Date(loan.startDate!).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge className="bg-green-500">Active</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Loan Amount:</span>
                        <p>₹{loan.amount.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Total Payable:</span>
                        <p>₹{loan.totalPayable.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Paid Amount:</span>
                        <p className="text-green-600">₹{loan.paidAmount.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Remaining:</span>
                        <p className="text-orange-600">
                          ₹{(loan.totalPayable - loan.paidAmount).toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Next Payment Date:</span>
                        <p>{loan.nextPaymentDate ? new Date(loan.nextPaymentDate).toLocaleDateString() : 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Next Payment Amount:</span>
                        <p>₹{loan.nextPaymentAmount?.toLocaleString('en-IN') || 0}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Payment Progress</span>
                        <span>{((loan.paidAmount / loan.totalPayable) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all"
                          style={{ width: `${(loan.paidAmount / loan.totalPayable) * 100}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="all-users" className="space-y-4">
            {allUsers.map((u) => (
              <Card key={u.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{u.name}</CardTitle>
                      <CardDescription>{u.email}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge className="capitalize">{u.role}</Badge>
                      <Badge 
                        variant={
                          u.status === 'approved' ? 'default' : 
                          u.status === 'rejected' ? 'destructive' : 
                          'secondary'
                        }
                      >
                        {u.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
