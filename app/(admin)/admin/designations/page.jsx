"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, MoreVertical, Pencil, Trash2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import {fetchCsrfToken} from "@/hooks/use-auth"

export default function DesignationsPage() {
  const [designations, setDesignations] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentDesignation, setCurrentDesignation] = useState(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    order: 0,
  })


  // Fetch designations
  useEffect(() => {
    const fetchDesignations = async () => {
      try {
        setLoading(true)
        const csrfToken = await fetchCsrfToken()
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/designations/`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken && { "X-CSRFToken": csrfToken }),
        }
      })
        if (response.ok) {
          const data = await response.json()
          setDesignations(data)
        }
      } catch (error) {
        console.error("Error fetching designations:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDesignations()
  }, [])

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

const handleAddDesignation = async (e) => {
  e.preventDefault();

  try {
    const csrfToken = await fetchCsrfToken()
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users/designations/`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken && { "X-CSRFToken": csrfToken }),
        },
        body: JSON.stringify(formData), 
      }
    );

    if (response.ok) {
      const newDesignation = await response.json();
      setDesignations([...designations, newDesignation]);
      setIsAddDialogOpen(false);
      setFormData({ title: "", description: "", order: 0 });
      toast({
        title: "Designation added",
        description: "New designation created",
      });
    } else {
      const err = await response.json().catch(() => ({}));
      toast({
        title: "Error",
        description: err.detail || "Cannot add designation",
        variant: "destructive",
      });
    }
  } catch (error) {
    console.error("Error adding designation:", error);
  }
};


  // Handle edit designation
  const handleEditDesignation = async (e) => {
  e.preventDefault();

  try {
    const csrfToken = await fetchCsrfToken()
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users/designations/${currentDesignation.id}/`,
      {
        method: "PUT",
        credentials: "include", // ✅ ensures sessionid + csrftoken cookies are sent
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken && { "X-CSRFToken": csrfToken }),
        },
        body: JSON.stringify(formData), // ✅ send plain JSON
      }
    );

    if (response.ok) {
      const updatedDesignation = await response.json();
      setDesignations(
        designations.map((d) =>
          d.id === updatedDesignation.id ? updatedDesignation : d
        )
      );
      setIsEditDialogOpen(false);
      setCurrentDesignation(null);
      setFormData({ title: "", description: "", order: 0 });
      toast({ title: "Updated", description: "Designation updated" });
    } else {
      const err = await response.json().catch(() => ({}));
      toast({
        title: "Error",
        description: err.detail || "Cannot update",
        variant: "destructive",
      });
    }
  } catch (error) {
    console.error("Error updating designation:", error);
  }
};

  // Handle delete designation
  const handleDeleteDesignation = async () => {
  try {
    const csrfToken = await fetchCsrfToken()
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users/designations/${currentDesignation.id}/`,
      {
        method: "DELETE",
        credentials: "include", // ✅ ensures sessionid + csrftoken cookies are sent
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken && { "X-CSRFToken": csrfToken }),
        }
      }
    );

    if (response.ok) {
      setDesignations(
        designations.filter((d) => d.id !== currentDesignation.id)
      );
      setIsDeleteDialogOpen(false);
      setCurrentDesignation(null);
      toast({ title: "Deleted", description: "Designation removed" });
    } else {
      const err = await response.json().catch(() => ({}));
      toast({
        title: "Error",
        description: err.detail || "Cannot delete",
        variant: "destructive",
      });
    }
  } catch (error) {
    console.error("Error deleting designation:", error);
  }
};


  // Open edit dialog
  const openEditDialog = (designation) => {
    setCurrentDesignation(designation)
    setFormData({
      title: designation.title,
      description: designation.description || "",
      order: designation.order ?? 0,
    })
    setIsEditDialogOpen(true)
  }

  // Open delete dialog
  const openDeleteDialog = (designation) => {
    setCurrentDesignation(designation)
    setIsDeleteDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Member Designations</h1>
          <p className="text-muted-foreground">Manage designations for organization members</p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Designation
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Designation</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddDesignation} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="order">Designation Order</Label>
                <Input
                  id="order"
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                  placeholder="e.g. 0-99 (higher number = lower priority)"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Designation Name</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Secretary, Treasurer"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the responsibilities of this designation"
                  rows={3}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Designation</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <p>Loading designations...</p>
          </div>
        ) : designations.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-40">
            <p className="text-muted-foreground mb-4">No designations found</p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Designation
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Designation Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {designations.map((designation) => (
                <TableRow key={designation.id}>
                  <TableCell className="font-medium">{designation.title}</TableCell>
                  <TableCell>{designation.description || "-"}</TableCell>
                  <TableCell>{new Date(designation.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(designation)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => openDeleteDialog(designation)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Designation</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditDesignation} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Designation Name</Label>
              <Input id="edit-name" name="name" value={formData.name} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Designation</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete the designation "{currentDesignation?.name}"? This will remove the
            designation from all members who currently have it.
          </p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteDesignation}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
