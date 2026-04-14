"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Plus, Trash2, Edit, ImageIcon, Video, Upload, X } from "lucide-react"
import { fetchCsrfToken } from "@/hooks/use-auth"

export default function AdminGalleryPage() {

const [galleryItems, setGalleryItems] = useState({ images: [], videos: [] });
const [activeTab, setActiveTab] = useState("images");
const [isAddingItem, setIsAddingItem] = useState(false);
const [editingItem, setEditingItem] = useState(null);
const [isDialogOpen, setIsDialogOpen] = useState(false);
const [isLoading, setIsLoading] = useState(false);

const [newItem, setNewItem] = useState({
  title: "",
  description: "",
  category: "events",
  type: "image", // serializer expects "type" (maps to media_type)
  url: "",
  thumbnail: "",
  imageFile: null,
  videoFile: null,
  thumbnailFile: null,
});

// Fetch gallery items
useEffect(() => {
  const fetchGalleryItems = async () => {
    try {
      const csrfToken = await fetchCsrfToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trust/galleryitem/`,
        {
          credentials: "include",
          headers: {
            ...(csrfToken && { "X-CSRFToken": csrfToken }),
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setGalleryItems({
          images: data.filter((item) => item.media_type === "image" || item.type === "image"),
          videos: data.filter((item) => item.media_type === "video" || item.type === "video"),
        });
      } else {
        throw new Error("Failed to fetch");
      }
    } catch (error) {
      console.error("Error fetching gallery items:", error);
      toast({
        title: "Error",
        description: "Failed to load gallery items",
        variant: "destructive",
      });
    }
  };

  fetchGalleryItems();
}, []);

const handleAddItem = () => {
  setIsDialogOpen(true);
  setIsAddingItem(true);
  setEditingItem(null);
  setNewItem({
    title: "",
    description: "",
    category: "events",
    type: activeTab === "images" ? "image" : "video",
    url: "",
    thumbnail: activeTab === "videos" ? "/placeholder.svg?height=300&width=400" : "",
    imageFile: null,
    videoFile: null,
    thumbnailFile: null,
  });
};

const backendToFrontendCategory = (cat) => {
  if (!cat) return "events";
  switch (cat.toLowerCase()) {
    case "event":
    case "event & celebration":
    case "events":
      return "events";
    case "service":
    case "serviceproject":
    case "serviceprojects":
      return "serviceProjects";
    case "volunteer":
    case "volunteers":
      return "volunteers";
    default:
      if (cat === "EVENT") return "events";
      if (cat === "SERVICE") return "serviceProjects";
      if (cat === "VOLUNTEER") return "volunteers";
      return "events";
  }
};

const handleEditItem = (item) => {
  setIsDialogOpen(true);
  setIsAddingItem(false);
  setEditingItem(item);
  setNewItem({
    title: item.title,
    description: item.description,
    category: backendToFrontendCategory(item.gallery_type || item.category),
    type: item.type, // serializer exposes "type"
    url: item.url || item.video_url || "",
    thumbnail: item.thumbnail || "",
    imageFile: null,
    videoFile: null,
    thumbnailFile: null,
  });
};

const handleDeleteItem = async (id, type) => {
  try {
    const csrfToken = await fetchCsrfToken();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/trust/galleryitem/${id}/`,
      {
        method: "DELETE",
        credentials: "include",
        headers: {
          ...(csrfToken && { "X-CSRFToken": csrfToken }),
        },
      }
    );

    if (response.ok) {
      if (type === "image") {
        setGalleryItems({
          ...galleryItems,
          images: galleryItems.images.filter((item) => item.id !== id),
        });
      } else {
        setGalleryItems({
          ...galleryItems,
          videos: galleryItems.videos.filter((item) => item.id !== id),
        });
      }

      toast({
        title: "Item Deleted",
        description: "The gallery item has been successfully removed.",
      });
    } else {
      throw new Error("Failed to delete gallery item");
    }
  } catch (error) {
    console.error("Error deleting gallery item:", error);
    toast({
      title: "Error",
      description: "Failed to delete gallery item",
      variant: "destructive",
    });
  }
};

const handleUploadFile = (e, fileType) => {
  const file = e.target.files[0];
  if (!file) return;

  if (fileType === "image") {
    setNewItem({
      ...newItem,
      imageFile: file,
      url: URL.createObjectURL(file),
    });
  } else if (fileType === "video") {
    setNewItem({
      ...newItem,
      videoFile: file,
      url: URL.createObjectURL(file),
    });
  } else if (fileType === "thumbnail") {
    setNewItem({
      ...newItem,
      thumbnailFile: file,
      thumbnail: URL.createObjectURL(file),
    });
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    const form = new FormData();
    form.append("title", newItem.title);
    form.append("description", newItem.description);
    form.append(
      "gallery_type",
      newItem.category === "events"
        ? "EVENT"
        : newItem.category === "serviceProjects"
        ? "SERVICE"
        : "VOLUNTEER"
    );
    form.append("type", newItem.type); // serializer expects "type"

    if (newItem.type === "image") {
      if (newItem.imageFile) {
        form.append("image_file", newItem.imageFile); // serializer maps this to model.image
      }
    } else {
      if (newItem.url) {
        form.append("url", newItem.url); // serializer maps this to model.video_url
      }
      if (newItem.thumbnailFile) {
        form.append("thumbnail_file", newItem.thumbnailFile);
      } else if (newItem.thumbnail) {
        form.append("thumbnail", newItem.thumbnail);
      }
    }

    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/trust/galleryitem/${
      editingItem ? editingItem.id + "/" : ""
    }`;

    const csrfToken = await fetchCsrfToken();
    const response = await fetch(endpoint, {
      method: editingItem ? "PUT" : "POST",
      credentials: "include",
      headers: {
        ...(csrfToken && { "X-CSRFToken": csrfToken }),
      },
      body: form,
    });

    if (!response.ok) throw new Error("Failed to save gallery item");

    const result = await response.json();

    if (editingItem) {
      if (newItem.type === "image") {
        setGalleryItems({
          ...galleryItems,
          images: galleryItems.images.map((item) =>
            item.id === editingItem.id ? result : item
          ),
        });
      } else {
        setGalleryItems({
          ...galleryItems,
          videos: galleryItems.videos.map((item) =>
            item.id === editingItem.id ? result : item
          ),
        });
      }

      toast({
        title: "Item Updated",
        description: "The gallery item has been successfully updated.",
      });
    } else {
      if (newItem.type === "image") {
        setGalleryItems({
          ...galleryItems,
          images: [...galleryItems.images, result],
        });
      } else {
        setGalleryItems({
          ...galleryItems,
          videos: [...galleryItems.videos, result],
        });
      }

      toast({
        title: "Item Added",
        description: "The new gallery item has been successfully added.",
      });
    }

    setIsDialogOpen(false);
    setEditingItem(null);
    setIsAddingItem(false);
  } catch (error) {
    console.error("Error saving gallery item:", error);
    toast({
      title: "Error",
      description: "Failed to save gallery item",
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Gallery Management</h1>
        <p className="text-muted-foreground">Manage images and videos displayed in the gallery section.</p>
      </div>

      <Tabs defaultValue="images" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="images" className="flex items-center">
            <ImageIcon className="mr-2 h-4 w-4" />
            Images
          </TabsTrigger>
          <TabsTrigger value="videos" className="flex items-center">
            <Video className="mr-2 h-4 w-4" />
            Videos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="images" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Image Gallery</CardTitle>
                <CardDescription>Manage images displayed in the gallery section</CardDescription>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-bhagva-700 hover:bg-bhagva-800" onClick={handleAddItem}>
                    <Plus className="mr-2 h-4 w-4" /> Add Image
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{isAddingItem ? "Add New Image" : "Edit Image"}</DialogTitle>
                    <DialogDescription>
                      {isAddingItem
                        ? "Add details for the new gallery image."
                        : "Update the details of the gallery image."}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={newItem.title}
                        onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                        placeholder="Enter image title"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newItem.description}
                        onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                        placeholder="Enter image description"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={newItem.category}
                        onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="events">Events & Celebrations</SelectItem>
                          <SelectItem value="serviceProjects">Service Projects</SelectItem>
                          <SelectItem value="volunteers">Our Volunteers</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Image</Label>
                      <div className="flex flex-col gap-4">
                        {newItem.url && (
                          <div className="relative w-full h-40 bg-muted rounded-md overflow-hidden">
                            <img
                              src={editingItem ? process.env.NEXT_PUBLIC_API_URL + newItem.url : newItem.url || "/placeholder.svg"}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 h-6 w-6"
                              onClick={() => setNewItem({ ...newItem, url: "" })}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        <div className="relative">
                          <Input
                            type="file"
                            accept="image/*"
                            id="image-upload"
                            onChange={(e) => handleUploadFile(e, "image")}
                            disabled={false}
                            className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full relative z-0"
                            disabled={false}
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Image
                          </Button>
                        </div>
                      </div>
                    </div>

                    <DialogFooter className="sticky bottom-0 right-0 pt-2 bg-white">
                      <Button type="submit" className="bg-bhagva-700 hover:bg-bhagva-800" disabled={isLoading}>
                        {isLoading ? "Saving..." : isAddingItem ? "Add Image" : "Save Changes"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {galleryItems.images.map((item) => (
                  <div key={item.id} className="relative group overflow-hidden rounded-md border">
                    <img src={(item.image || item.url) && !item.image?.startsWith('http') ? process.env.NEXT_PUBLIC_API_URL + (item.image || item.url) : (item.image || item.url) || "/placeholder.svg"} alt={item.title} className="w-full h-48 object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4 text-white">
                      <h3 className="font-semibold text-lg">{item.title}</h3>
                      <p className="text-sm text-white/90">{item.description}</p>
                      <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-8 w-8"
                          type="button"
                          onClick={() => handleEditItem(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDeleteItem(item.id, "image")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="videos" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Video Gallery</CardTitle>
                <CardDescription>Manage videos displayed in the gallery section</CardDescription>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-bhagva-700 hover:bg-bhagva-800" onClick={handleAddItem}>
                    <Plus className="mr-2 h-4 w-4" /> Add Video
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{isAddingItem ? "Add New Video" : "Edit Video"}</DialogTitle>
                    <DialogDescription>
                      {isAddingItem
                        ? "Add details for the new gallery video."
                        : "Update the details of the gallery video."}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={newItem.title}
                        onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                        placeholder="Enter video title"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newItem.description}
                        onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                        placeholder="Enter video description"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={newItem.category}
                        onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="events">Events & Celebrations</SelectItem>
                          <SelectItem value="serviceProjects">Service Projects</SelectItem>
                          <SelectItem value="volunteers">Our Volunteers</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Video</Label>
                      <div className="relative">
                        <Input
                          type="file"
                          accept="video/*"
                          id="video-upload"
                          onChange={(e) => handleUploadFile(e, "video")}
                          disabled={false}
                          className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
                        />
                        <Button type="button" variant="outline" className="w-full relative z-0" disabled={false}>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Video
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Thumbnail</Label>
                      <div className="flex flex-col gap-4">
                        {newItem.thumbnail && (
                          <div className="relative w-full h-40 bg-muted rounded-md overflow-hidden">
                            <img
                              src={newItem.thumbnail || "/placeholder.svg"}
                              alt="Thumbnail Preview"
                              className="w-full h-full object-cover"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 h-6 w-6"
                              onClick={() => setNewItem({ ...newItem, thumbnail: "" })}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        <div className="relative">
                          <Input
                            type="file"
                            accept="image/*"
                            id="thumbnail-upload"
                            onChange={(e) => handleUploadFile(e, "thumbnail")}
                            disabled={false}
                            className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full relative z-0"
                            // disabled={isUploading}
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Thumbnail
                          </Button>
                        </div>
                      </div>
                    </div>

                    <DialogFooter className="sticky bottom-0 right-0 pt-2 bg-white">
                      <Button type="submit" className="bg-bhagva-700 hover:bg-bhagva-800" disabled={isLoading}>
                        {isLoading ? "Saving..." : isAddingItem ? "Add Video" : "Save Changes"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {galleryItems.videos.map((item) => (
                  <div key={item.id} className="relative group overflow-hidden rounded-md border">
                    <div className="relative">
                      <img
                        src={item.thumbnail || "/placeholder.svg"}
                        alt={item.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-12 w-12 rounded-full bg-black/50 flex items-center justify-center">
                          <Video className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                      <div className="mt-2 flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={() => handleEditItem(item)}
                        >
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteItem(item.id, "video")}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
