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
import { DollarSign, TrendingUp, Users, Calendar, CheckCircle2, Plus, MessageSquare, Send } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

export default function LenderDashboard() {
  const { user } = useAuth();
  const { loans, getLoansForUser, getPaymentsForLoan, loanOffers, addLoanOffer, updateLoanOffer, addMessage, getMessagesForLoan } = useData();
  const [openOfferDialog, setOpenOfferDialog] = useState(false);
  const [openMessageDialog, setOpenMessageDialog] = useState(false);
  const [selectedLoanForChat, setSelectedLoanForChat] = useState<string>('');
  const [newMessage, setNewMessage] = useState('');
  
  const [offerForm, setOfferForm] = useState({
    amount: '',
    interestRate: '',
    minTenure: '',
    maxTenure: '',
    description: '',
    requirements: '',
  });

  const userLoans = getLoansForUser(user!.id, 'lender');
  const userOffers = loanOffers.filter(o => o.lenderId === user!.id);
  const activeOffers = userOffers.filter(o => o.status === 'active');
  const activeLoans = userLoans.filter(l => l.status === 'active');
  const pendingLoans = userLoans.filter(l => l.status === 'pending');
  const completedLoans = userLoans.filter(l => l.status === 'completed');
  
  const totalLent = userLoans.reduce((sum, loan) => sum + loan.amount, 0);
  const totalCollected = userLoans.reduce((sum, loan) => sum + loan.paidAmount, 0);
  const totalPending = userLoans.reduce((sum, loan) => 
    loan.status === 'active' ? sum + (loan.totalPayable - loan.paidAmount) : sum, 0
  );
  const totalInterestEarned = userLoans.reduce((sum, loan) => 
    sum + (loan.paidAmount - (loan.amount * (loan.paidAmount / loan.totalPayable))), 0
  );

  const handleCreateOffer = (e: React.FormEvent) => {
    e.preventDefault();
    
    addLoanOffer({
      lenderId: user!.id,
      lenderName: user!.name,
      amount: parseFloat(offerForm.amount),
      interestRate: parseFloat(offerForm.interestRate),
      minTenure: parseInt(offerForm.minTenure),
      maxTenure: parseInt(offerForm.maxTenure),
      description: offerForm.description,
      requirements: offerForm.requirements,
      status: 'active',
    });
    
    setOpenOfferDialog(false);
    setOfferForm({
      amount: '',
      interestRate: '',
      minTenure: '',
      maxTenure: '',
      description: '',
      requirements: '',
    });
  };

  const handleSendMessage = () => {
    if (!selectedLoanForChat || !newMessage.trim()) return;
    
    addMessage({
      loanId: selectedLoanForChat,
      senderId: user!.id,
      senderName: user!.name,
      senderRole: 'lender',
      message: newMessage,
    });
    
    setNewMessage('');
  };

  const openChatForLoan = (loanId: string) => {
    setSelectedLoanForChat(loanId);
    setOpenMessageDialog(true);
  };

  return (
    <DashboardLayout title="Lender Dashboard">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Total Lent</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">₹{totalLent.toLocaleString('en-IN')}</div>
              <p className="text-xs text-muted-foreground">
                {userLoans.length} loans
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Total Collected</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-green-600">₹{totalCollected.toLocaleString('en-IN')}</div>
              <p className="text-xs text-muted-foreground">
                {completedLoans.length} completed
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Pending Collection</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-orange-600">₹{totalPending.toLocaleString('en-IN')}</div>
              <p className="text-xs text-muted-foreground">
                {activeLoans.length} active loans
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Interest Earned</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-blue-600">₹{Math.round(totalInterestEarned).toLocaleString('en-IN')}</div>
              <p className="text-xs text-muted-foreground">
                From all loans
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Create Loan Offer Button */}
        <Dialog open={openOfferDialog} onOpenChange={setOpenOfferDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Loan Offer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Loan Offer</DialogTitle>
              <DialogDescription>
                Set up a loan offer that borrowers can apply for
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleCreateOffer} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Maximum Loan Amount (₹) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="e.g., 500000"
                    value={offerForm.amount}
                    onChange={(e) => setOfferForm({ ...offerForm, amount: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="interestRate">Interest Rate (%) *</Label>
                  <Input
                    id="interestRate"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 10.5"
                    value={offerForm.interestRate}
                    onChange={(e) => setOfferForm({ ...offerForm, interestRate: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="minTenure">Minimum Tenure (Months) *</Label>
                  <Input
                    id="minTenure"
                    type="number"
                    placeholder="e.g., 6"
                    value={offerForm.minTenure}
                    onChange={(e) => setOfferForm({ ...offerForm, minTenure: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maxTenure">Maximum Tenure (Months) *</Label>
                  <Input
                    id="maxTenure"
                    type="number"
                    placeholder="e.g., 60"
                    value={offerForm.maxTenure}
                    onChange={(e) => setOfferForm({ ...offerForm, maxTenure: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Offer Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your loan offer..."
                  value={offerForm.description}
                  onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })}
                  required
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="requirements">Eligibility Requirements *</Label>
                <Textarea
                  id="requirements"
                  placeholder="List the requirements for borrowers..."
                  value={offerForm.requirements}
                  onChange={(e) => setOfferForm({ ...offerForm, requirements: e.target.value })}
                  required
                  rows={3}
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setOpenOfferDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">Create Offer</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Tabs defaultValue="offers" className="space-y-4">
          <TabsList>
            <TabsTrigger value="offers">My Offers ({activeOffers.length})</TabsTrigger>
            <TabsTrigger value="active">Active Loans ({activeLoans.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending Approval ({pendingLoans.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedLoans.length})</TabsTrigger>
            <TabsTrigger value="payments">Payment History</TabsTrigger>
          </TabsList>

          <TabsContent value="offers" className="space-y-4">
            {activeOffers.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-gray-500">No active loan offers. Create one to get started!</p>
                </CardContent>
              </Card>
            ) : (
              activeOffers.map((offer) => (
                <Card key={offer.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>Loan Offer #{offer.id.slice(-6)}</CardTitle>
                        <CardDescription>
                          Created on {new Date(offer.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge className="bg-green-500">Active</Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateLoanOffer(offer.id, { status: 'inactive' })}
                        >
                          Deactivate
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Maximum Amount:</span>
                        <p className="text-lg">₹{offer.amount.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Interest Rate:</span>
                        <p className="text-lg">{offer.interestRate}%</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Tenure Range:</span>
                        <p>{offer.minTenure} - {offer.maxTenure} months</p>
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
                        <CardTitle>Loan to {loan.borrowerName}</CardTitle>
                        <CardDescription>
                          Started {new Date(loan.startDate!).toLocaleDateString()} • Loan #{loan.id.slice(-6)}
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
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Principal:</span>
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
                      <div>
                        <span className="text-gray-500">Total Payable:</span>
                        <p>₹{loan.totalPayable.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Collected:</span>
                        <p className="text-green-600">₹{loan.paidAmount.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Remaining:</span>
                        <p className="text-orange-600">₹{(loan.totalPayable - loan.paidAmount).toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Surety:</span>
                        <p>{loan.suretyName || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <Alert className="bg-blue-50 border-blue-200">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800">
                        <p className="font-semibold">Next Payment Expected</p>
                        <p>Date: {loan.nextPaymentDate ? new Date(loan.nextPaymentDate).toLocaleDateString() : 'N/A'}</p>
                        <p>Amount: ₹{loan.nextPaymentAmount?.toLocaleString('en-IN') || 0}</p>
                      </AlertDescription>
                    </Alert>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Collection Progress</span>
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
                  <p className="text-center text-gray-500">No pending loan applications</p>
                </CardContent>
              </Card>
            ) : (
              pendingLoans.map((loan) => (
                <Card key={loan.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>Loan Application from {loan.borrowerName}</CardTitle>
                        <CardDescription>
                          Applied on {new Date(loan.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">Pending Admin Approval</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Requested Amount:</span>
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
                        <span className="text-gray-500">Purpose:</span>
                        <p>{loan.purpose}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500">Surety:</span>
                        <p>{loan.suretyName || 'No surety provided'}</p>
                      </div>
                    </div>
                    <Alert className="mt-4">
                      <AlertDescription>
                        This loan is pending admin approval. You will be notified once it's processed.
                      </AlertDescription>
                    </Alert>
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
              completedLoans.map((loan) => {
                const interestEarned = loan.totalPayable - loan.amount;
                return (
                  <Card key={loan.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>Loan to {loan.borrowerName}</CardTitle>
                          <CardDescription>Fully Repaid</CardDescription>
                        </div>
                        <Badge className="bg-blue-500">Completed</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Principal:</span>
                          <p>₹{loan.amount.toLocaleString('en-IN')}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Interest Earned:</span>
                          <p className="text-green-600">₹{Math.round(interestEarned).toLocaleString('en-IN')}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Total Collected:</span>
                          <p className="text-green-600">₹{loan.paidAmount.toLocaleString('en-IN')}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Duration:</span>
                          <p>{loan.tenure} months</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Payments</CardTitle>
                <CardDescription>Track all payments received from borrowers</CardDescription>
              </CardHeader>
              <CardContent>
                {activeLoans.length === 0 && completedLoans.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No payment history available</p>
                ) : (
                  <div className="space-y-4">
                    {[...activeLoans, ...completedLoans].map((loan) => {
                      const payments = getPaymentsForLoan(loan.id);
                      if (payments.length === 0) return null;
                      
                      return (
                        <div key={loan.id} className="space-y-2">
                          <h4 className="text-sm">
                            {loan.borrowerName} - Loan #{loan.id.slice(-6)}
                          </h4>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {payments.map((payment) => (
                                <TableRow key={payment.id}>
                                  <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                                  <TableCell>₹{payment.amount.toLocaleString('en-IN')}</TableCell>
                                  <TableCell className="capitalize">{payment.type}</TableCell>
                                  <TableCell>
                                    <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                                      {payment.status}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Message Dialog */}
        <Dialog open={openMessageDialog} onOpenChange={setOpenMessageDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Borrower Communication</DialogTitle>
              <DialogDescription>
                {selectedLoanForChat && `Loan #${selectedLoanForChat.slice(-6)} - ${
                  userLoans.find(l => l.id === selectedLoanForChat)?.borrowerName
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
                    className={`flex ${msg.senderRole === 'lender' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        msg.senderRole === 'lender'
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
