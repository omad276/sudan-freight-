'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { getUsers, verifyUser, toggleUserActive } from '@/actions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner, EmptyState } from '@/components/shared';
import {
  MoreVertical,
  CheckCircle,
  XCircle,
  UserCheck,
  UserX,
  Phone,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { Profile, UserRole } from '@/types';

export default function UsersPage() {
  const { t, language } = useLanguage();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    const result = await getUsers();
    if (result.data) {
      setUsers(result.data as Profile[]);
    }
    setLoading(false);
  }

  async function handleVerify(userId: string) {
    await verifyUser(userId, true);
    loadUsers();
  }

  async function handleToggleActive(userId: string) {
    await toggleUserActive(userId);
    loadUsers();
  }

  const filteredUsers = users.filter((u) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'shipper') return u.role === 'shipper';
    if (activeTab === 'carrier') return u.role === 'carrier';
    if (activeTab === 'unverified') return !u.is_verified;
    return true;
  });

  if (loading) {
    return <LoadingSpinner className="py-12" />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('userManagement')}</h1>

      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b px-4">
              <TabsList className="bg-transparent">
                <TabsTrigger value="all">
                  {t('all')} ({users.length})
                </TabsTrigger>
                <TabsTrigger value="shipper">
                  {t('shipper')} ({users.filter(u => u.role === 'shipper').length})
                </TabsTrigger>
                <TabsTrigger value="carrier">
                  {t('carrier')} ({users.filter(u => u.role === 'carrier').length})
                </TabsTrigger>
                <TabsTrigger value="unverified">
                  {t('notVerified')} ({users.filter(u => !u.is_verified).length})
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={activeTab} className="m-0">
              {filteredUsers.length === 0 ? (
                <EmptyState icon="user" title={t('noData')} />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('name')}</TableHead>
                      <TableHead>{t('email')}</TableHead>
                      <TableHead>{t('selectRole')}</TableHead>
                      <TableHead>{t('city')}</TableHead>
                      <TableHead>{t('status')}</TableHead>
                      <TableHead>{t('memberSince')}</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            {user.company_name && (
                              <p className="text-sm text-muted-foreground">
                                {user.company_name}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span dir="ltr">{user.email}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{t(user.role as any)}</Badge>
                        </TableCell>
                        <TableCell>
                          {user.city ? t(user.city as any) : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Badge variant={user.is_verified ? 'verified' : 'unverified'}>
                              {user.is_verified ? t('verified') : t('notVerified')}
                            </Badge>
                            {!user.is_active && (
                              <Badge variant="destructive">{t('suspended')}</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(user.created_at, language)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {!user.is_verified && (
                                <DropdownMenuItem onClick={() => handleVerify(user.id)}>
                                  <UserCheck className="h-4 w-4 ml-2" />
                                  {t('verifyUser')}
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => handleToggleActive(user.id)}>
                                {user.is_active ? (
                                  <>
                                    <UserX className="h-4 w-4 ml-2" />
                                    {t('suspendUser')}
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4 ml-2" />
                                    {t('activateUser')}
                                  </>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
