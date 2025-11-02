import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Tool {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error';
  description: string;
  icon: string;
  category: string;
}

interface ModalProps {
  type: 'open' | 'credentials' | 'info' | null;
  tool: Tool | null;
  onClose: () => void;
}

export const Modal: React.FC<ModalProps> = ({ type, tool, onClose }) => {
  if (!type || !tool) return null;

  const getContent = () => {
    switch (type) {
      case 'open':
        return {
          title: `Open ${tool.name}`,
          description: `Launch ${tool.name} in a new window or tab.`,
          content: (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This will open {tool.name} in your default browser.
              </p>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  // TODO: Implement opening tool
                  window.open('#', '_blank');
                  onClose();
                }}>
                  Open Tool
                </Button>
              </div>
            </div>
          )
        };

      case 'credentials':
        return {
          title: `${tool.name} Credentials`,
          description: 'Manage authentication credentials for this tool.',
          content: (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" placeholder="Enter username" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="Enter password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="api-key">API Key (Optional)</Label>
                  <Input id="api-key" placeholder="Enter API key" />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  // TODO: Save credentials
                  console.log('Saving credentials for', tool.name);
                  onClose();
                }}>
                  Save Credentials
                </Button>
              </div>
            </div>
          )
        };

      case 'info':
        return {
          title: `${tool.name} Information`,
          description: 'Detailed information about this security tool.',
          content: (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {tool.description}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Category</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {tool.category}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 capitalize">
                    {tool.status}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Technical Details</Label>
                  <Textarea
                    className="mt-1"
                    placeholder="Additional technical information..."
                    rows={4}
                    readOnly
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          )
        };

      default:
        return { title: '', description: '', content: null };
    }
  };

  const { title, description, content } = getContent();

  return (
    <Dialog open={!!type} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
};