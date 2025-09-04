"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Plus, Search, Edit, Trash2, Shield, GraduationCap, Users, UserCheck } from "lucide-react"
import { authService } from "@/lib/auth"
import { useAuth } from "@/hooks/use-auth"
import type { User } from "@/types/auth"
import { CreateUserForm } from "./create-user-form"
import { EditUserForm } from "./edit-user-form"
import { EmptyState } from "@/components/ui/empty-state"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export function UsersSection() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const loadUsers = async () => {
    setIsLoading(true)
    try {
      const allUsers = await authService.getAllUsers()
      setUsers(allUsers)
      setFilteredUsers(allUsers)
      console.log({ allUsers });
      
    } catch (error) {
      console.error("Failed to load users:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = users.filter(
        (user) =>
          user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.role.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredUsers(filtered)
    } else {
      setFilteredUsers(users)
    }
  }, [searchTerm, users])

  const handleCreateUser = async () => {
    await loadUsers()
    setIsCreateDialogOpen(false)
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setIsEditDialogOpen(true)
  }

  const handleUpdateUser = async () => {
    await loadUsers()
    setIsEditDialogOpen(false)
    setSelectedUser(null)
  }

  const handleDeleteUser = (userId: string) => {
    const updatedUsers = users.filter((user) => user.id !== userId)
    localStorage.setItem("e-cheating-users", JSON.stringify(updatedUsers))
    setUsers(updatedUsers)
  }

  const getRoleBadge = (role: User["role"]) => {
    return role === "ADMIN" ? (
      <Badge variant="default" className="flex items-center gap-1">
        <Shield className="h-3 w-3" />
        ADMIN
      </Badge>
    ) : (
      <Badge variant="secondary" className="flex items-center gap-1">
        <GraduationCap className="h-3 w-3" />
        Lecturer
      </Badge>
    )
  }

  const stats = {
    total: users.length,
    ADMINs: users.filter((u) => u.role === "ADMIN").length,
    lecturers: users.filter((u) => u.role === "LECTURER").length,
    active: users.length,
  }

  if (currentUser?.role !== "ADMIN") {
    return (
      <div className="flex items-center justify-center h-64">
        <EmptyState
          icon={Shield}
          title="Access Restricted"
          description="Only ADMINistrators can manage users."
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header and Add User */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-muted-foreground">Manage system users and their permissions</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>Add a new ADMIN or lecturer to the system</DialogDescription>
            </DialogHeader>
            <CreateUserForm onSuccess={handleCreateUser} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Users", icon: Users, value: stats.total, color: "text-foreground" },
          { title: "ADMINistrators", icon: Shield, value: stats.ADMINs, color: "text-blue-600" },
          { title: "Lecturers", icon: GraduationCap, value: stats.lecturers, color: "text-green-600" },
          { title: "Active Users", icon: UserCheck, value: stats.active, color: "text-green-600" },
        ].map((stat) => (
          <Card key={stat.title} className="transition-all duration-200 hover:shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">{stat.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
          <CardDescription>Manage system users and their access levels</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No users found"
              description="No users match your search criteria."
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="hidden lg:table-cell">Created</TableHead>
                    <TableHead className="hidden xl:table-cell">Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="transition-colors hover:bg-muted/50">
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{user.fullName}</p>
                          <p className="text-xs text-muted-foreground md:hidden">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{user.email}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                            disabled={user.id === currentUser?.id}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" disabled={user.id === currentUser?.id}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete User</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {user.fullName}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information and permissions</DialogDescription>
          </DialogHeader>
          {selectedUser && <EditUserForm user={selectedUser} onSuccess={handleUpdateUser} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
