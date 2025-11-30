import { useState } from 'react';
import DashboardLayout from './DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DollarSign, Calendar, TrendingUp, Plus, Clock, CheckCircle2, MessageSquare, Send, ShoppingBag } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

export default function BorrowerDashboard() {
  const { user } = useAuth();
  const { loans, addLoan, getLoansForUser, addPayment, getPaymentsForLoan, getActiveLoanOffers, addMessage, getMessagesForLoan } = useData();
  const [openDialog, setOpenDialog] = useState(false);
  const [openOffersDialog, setOpenOffersDialog] = useState(false);
  const [openMessageDialog, setOpenMessageDialog] = useState(false);
  const [selectedLoanForChat, setSelectedLoanForChat] = useState<string>('');
  const [newMessage, setNewMessage] = useState('');
  const [selectedLoan, setSelectedLoan] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  
  const [loanForm, setLoanForm] = useState({
    lenderId: '',
    lenderName: '',
    amount: '',
    interestRate: '',
    tenure: '',
    suretyId: '',
    suretyName: '',
    purpose: '',
    offerId: '',
  });

  const userLoans = getLoansForUser(user!.id, 'borrower');
  const activeLoans = userLoans.filter(l => l.status === 'active');
  const pendingLoans = userLoans.filter(l => l.status === 'pending');
  const completedLoans = userLoans.filter(l => l.status === 'completed');
  const loanOffers = getActiveLoanOffers();

  const calculateLoan = () => {
    const principal = parseFloat(loanForm.amount);
    const rate = parseFloat(loanForm.interestRate) / 100 / 12;
    const months = parseInt(loanForm.tenure);
    
    if (!principal || !rate || !months) return { monthly: 0, total: 0 };
    
    const monthlyPayment = (principal * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
    const totalPayable = monthlyPayment * months;
    
    return {
      monthly: Math.round(monthlyPayment * 100) / 100,
      total: Math.round(totalPayable * 100) / 100,
    };
  };

  const handleApplyFromOffer = (offer: any) => {
    setSelectedOffer(offer);
    setLoanForm({
      ...loanForm,
      lenderId: offer.lenderId,
      lenderName: offer.lenderName,
      interestRate: offer.interestRate.toString(),
      offerId: offer.id,
    });
    setOpenOffersDialog(false);
    setOpenDialog(true);
  };

  const handleSubmitLoan = (e: React.FormEvent) => {
    e.preventDefault();
    
    const { monthly, total } = calculateLoan();
    
    addLoan({
      lenderId: loanForm.lenderId,
      borrowerId: user!.id,
      suretyId: loanForm.suretyId || undefined,
      amount: parseFloat(loanForm.amount),
      interestRate: parseFloat(loanForm.interestRate),
      tenure: parseInt(loanForm.tenure),
      status: 'pending',
      monthlyPayment: monthly,
      totalPayable: total,
      paidAmount: 0,
      lenderName: loanForm.lenderName,
      borrowerName: user!.name,
      suretyName: loanForm.suretyName || undefined,
      purpose: loanForm.purpose,
      offerId: loanForm.offerId || undefined,
    });
    
    setOpenDialog(false);
    setLoanForm({
      lenderId: '',
      lenderName: '',
      amount: '',
      interestRate: '',
      tenure: '',
      suretyId: '',
      suretyName: '',
      purpose: '',
      offerId: '',
    });
    setSelectedOffer(null);
  };

  const handleMakePayment = () => {
    if (!selectedLoan || !paymentAmount) return;
    
    const loan = loans.find(l => l.id === selectedLoan);
    if (!loan) return;
    
    const amount = parseFloat(paymentAmount);
    const remaining = loan.totalPayable - loan.paidAmount;
    
    addPayment({
      loanId: selectedLoan,
      amount: amount,
      date: new Date().toISOString(),
      type: amount >= remaining ? 'full' : amount >= loan.monthlyPayment ? 'monthly' : 'partial',
      status: 'completed',
      month: Math.floor(loan.paidAmount / loan.monthlyPayment) + 1,
    });
    
    setSelectedLoan('');
    setPaymentAmount('');
  };

  const handleSendMessage = () => {
    if (!selectedLoanForChat || !newMessage.trim()) return;
    
    addMessage({
      loanId: selectedLoanForChat,
      senderId: user!.id,
      senderName: user!.name,
      senderRole: 'borrower',
      message: newMessage,
    });
    
    setNewMessage('');
  };

  const openChatForLoan = (loanId: string) => {
    setSelectedLoanForChat(loanId);
    setOpenMessageDialog(true);
  };

  const totalBorrowed = userLoans.reduce((sum, loan) => sum + loan.amount, 0);
  const totalPaid = userLoans.reduce((sum, loan) => sum + loan.paidAmount, 0);
  const totalRemaining = userLoans.reduce((sum, loan) => 
    loan.status === 'active' ? sum + (loan.totalPayable - loan.paidAmount) : sum, 0
  );

  return (
    <DashboardLayout title="Borrower Dashboard">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Total Borrowed</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">₹{totalBorrowed.toLocaleString('en-IN')}</div>
              <p className="text-xs text-muted-foreground">
                {userLoans.length} loans
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Total Paid</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-green-600">₹{totalPaid.toLocaleString('en-IN')}</div>
              <p className="text-xs text-muted-foreground">
                {completedLoans.length} completed
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Remaining</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-orange-600">₹{totalRemaining.toLocaleString('en-IN')}</div>
              <p className="text-xs text-muted-foreground">
                {activeLoans.length} active loans
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Pending Applications</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{pendingLoans.length}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting approval
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Dialog open={openOffersDialog} onOpenChange={setOpenOffersDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Browse Loan Offers ({loanOffers.length})
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Available Loan Offers</DialogTitle>
                <DialogDescription>
                  Choose from available loan offers from verified lenders
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {loanOffers.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No loan offers available at the moment</p>
                ) : (
                  loanOffers.map((offer) => (
                    <Card key={offer.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle>{offer.lenderName}</CardTitle>
                            <CardDescription>Offer #{offer.id.slice(-6)}</CardDescription>
                          </div>
                          <Badge className="bg-green-500">Active</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Max Amount:</span>
                            <p className="text-lg">₹{offer.amount.toLocaleString('en-IN')}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Interest Rate:</span>
                            <p className="text-lg">{offer.interestRate}%</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Tenure:</span>
                            <p>{offer.minTenure}-{offer.maxTenure} months</p>
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-gray-500 text-sm">Description:</span>
                          <p className="text-sm mt-1">{offer.description}</p>
                        </div>
                        
                        <div>
                          <span className="text-gray-500 text-sm">Requirements:</span>
                          <p className="text-sm mt-1">{offer.requirements}</p>
                        </div>
                        
                        <Button onClick={() => handleApplyFromOffer(offer)} className="w-full">
                          Apply for This Loan
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Apply for Custom Loan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Apply for a Loan</DialogTitle>
                <DialogDescription>
                  {selectedOffer ? `Applying for loan from ${selectedOffer.lenderName}` : 'Fill in the loan details and submit for approval'}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmitLoan} className="space-y-4">
                {!selectedOffer && (
                  <div className="space-y-2">
                    <Label htmlFor="lender">Select Lender *</Label>
                    <Select 
                      value={loanForm.lenderId} 
                      onValueChange={(value) => {
                        const users = JSON.parse(localStorage.getItem('users') || '[]');
                        const lender = users.find((l: any) => l.id === value && l.role === 'lender' && l.status === 'approved');
                        setLoanForm({
                          ...loanForm,
                          lenderId: value,
                          lenderName: lender?.name || ''
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a lender" />
                      </SelectTrigger>
                      <SelectContent>
                        {JSON.parse(localStorage.getItem('users') || '[]')
                          .filter((u: any) => u.role === 'lender' && u.status === 'approved')
                          .map((lender: any) => (
                            <SelectItem key={lender.id} value={lender.id}>
                              {lender.name} - {lender.businessName}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Loan Amount (₹) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount"
                      value={loanForm.amount}
                      onChange={(e) => setLoanForm({ ...loanForm, amount: e.target.value })}
                      required
                    />
                    {selectedOffer && (
                      <p className="text-xs text-gray-500">Max: ₹{selectedOffer.amount.toLocaleString('en-IN')}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="interestRate">Interest Rate (%) *</Label>
                    <Input
                      id="interestRate"
                      type="number"
                      step="0.1"
                      placeholder="e.g., 10.5"
                      value={loanForm.interestRate}
                      onChange={(e) => setLoanForm({ ...loanForm, interestRate: e.target.value })}
                      required
                      disabled={!!selectedOffer}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tenure">Tenure (Months) *</Label>
                    <Input
                      id="tenure"
                      type="number"
                      placeholder="e.g., 12"
                      value={loanForm.tenure}
                      onChange={(e) => setLoanForm({ ...loanForm, tenure: e.target.value })}
                      required
                    />
                    {selectedOffer && (
                      <p className="text-xs text-gray-500">
                        Range: {selectedOffer.minTenure}-{selectedOffer.maxTenure} months
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="suretyName">Surety Name (Optional)</Label>
                  <Input
                    id="suretyName"
                    placeholder="Enter surety name"
                    value={loanForm.suretyName}
                    onChange={(e) => setLoanForm({ 
                      ...loanForm, 
                      suretyName: e.target.value,
                      suretyId: e.target.value ? `surety-${Date.now()}` : ''
                    })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="purpose">Loan Purpose *</Label>
                  <Textarea
                    id="purpose"
                    placeholder="Describe the purpose of the loan"
                    value={loanForm.purpose}
                    onChange={(e) => setLoanForm({ ...loanForm, purpose: e.target.value })}
                    required
                  />
                </div>
                
                {loanForm.amount && loanForm.interestRate && loanForm.tenure && (
                  <Alert>
                    <AlertDescription>
                      <div className="space-y-1">
                        <p>Monthly Payment: <span className="font-semibold">₹{calculateLoan().monthly.toLocaleString('en-IN')}</span></p>
                        <p>Total Payable: <span className="font-semibold">₹{calculateLoan().total.toLocaleString('en-IN')}</span></p>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => {
                    setOpenDialog(false);
                    setSelectedOffer(null);
                  }} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">Submit Application</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="active" className="space-y-4">
          <TabsList>
            <TabsTrigger value="active">Active Loans ({activeLoans.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingLoans.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedLoans.length})</TabsTrigger>
            <TabsTrigger value="payments">Make Payment</TabsTrigger>
          </TabsList>

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
                        <CardTitle>Loan from {loan.lenderName}</CardTitle>
                        <CardDescription>
                          Started {new Date(loan.startDate!).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge className="bg-green-500">Active</Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openChatForLoan(loan.id)}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Chat
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Loan Amount:</span>
                        <p className="text-lg">₹{loan.amount.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Interest Rate:</span>
                        <p className="text-lg">{loan.interestRate}%</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Monthly Payment:</span>
                        <p className="text-lg">₹{loan.monthlyPayment.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Tenure:</span>
                        <p>{loan.tenure} months</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Paid So Far:</span>
                        <p className="text-green-600">₹{loan.paidAmount.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Remaining:</span>
                        <p className="text-orange-600">₹{(loan.totalPayable - loan.paidAmount).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                    
                    <Alert className="bg-blue-50 border-blue-200">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800">
                        <p className="font-semibold">Next Payment Due</p>
                        <p>Date: {loan.nextPaymentDate ? new Date(loan.nextPaymentDate).toLocaleDateString() : 'N/A'}</p>
                        <p>Amount: ₹{loan.nextPaymentAmount?.toLocaleString('en-IN') || 0}</p>
                      </AlertDescription>
                    </Alert>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Repayment Progress</span>
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

          <TabsContent value="pending" className="space-y-4">
            {pendingLoans.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-gray-500">No pending applications</p>
                </CardContent>
              </Card>
            ) : (
              pendingLoans.map((loan) => (
                <Card key={loan.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>Loan Application to {loan.lenderName}</CardTitle>
                        <CardDescription>
                          Applied on {new Date(loan.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">Pending Approval</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Amount:</span>
                        <p>₹{loan.amount.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Interest Rate:</span>
                        <p>{loan.interestRate}%</p>
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
                        <span className="text-gray-500">Purpose:</span>
                        <p>{loan.purpose}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedLoans.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-gray-500">No completed loans</p>
                </CardContent>
              </Card>
            ) : (
              completedLoans.map((loan) => (
                <Card key={loan.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>Loan from {loan.lenderName}</CardTitle>
                        <CardDescription>Fully Repaid</CardDescription>
                      </div>
                      <Badge className="bg-blue-500">Completed</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Loan Amount:</span>
                        <p>₹{loan.amount.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Total Paid:</span>
                        <p className="text-green-600">₹{loan.paidAmount.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Make a Payment</CardTitle>
                <CardDescription>Select a loan and enter payment amount</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Loan</Label>
                  <Select value={selectedLoan} onValueChange={setSelectedLoan}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an active loan" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeLoans.map((loan) => (
                        <SelectItem key={loan.id} value={loan.id}>
                          {loan.lenderName} - ₹{(loan.totalPayable - loan.paidAmount).toLocaleString('en-IN')} remaining
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedLoan && (
                  <>
                    <div className="space-y-2">
                      <Label>Payment Amount (₹)</Label>
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                      />
                    </div>
                    
                    <Button onClick={handleMakePayment} className="w-full">
                      Submit Payment
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Message Dialog */}
        <Dialog open={openMessageDialog} onOpenChange={setOpenMessageDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Lender Communication</DialogTitle>
              <DialogDescription>
                {selectedLoanForChat && `Loan #${selectedLoanForChat.slice(-6)} - ${
                  userLoans.find(l => l.id === selectedLoanForChat)?.lenderName
                }`}
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto space-y-3 p-4 border rounded-md bg-gray-50 min-h-[300px] max-h-[400px]">
              {selectedLoanForChat && getMessagesForLoan(selectedLoanForChat).length === 0 ? (
                <p className="text-center text-gray-500">No messages yet. Start the conversation!</p>
              ) : (
                getMessagesForLoan(selectedLoanForChat).map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderRole === 'borrower' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        msg.senderRole === 'borrower'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white border'
                      }`}
                    >
                      <p className="text-xs opacity-75 mb-1">{msg.senderName}</p>
                      <p className="text-sm">{msg.message}</p>
                      <p className="text-xs opacity-75 mt-1">
                        {new Date(msg.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button onClick={handleSendMessage}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
