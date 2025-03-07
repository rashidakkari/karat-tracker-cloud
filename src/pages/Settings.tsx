
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { localStorageService } from "@/services/localStorageService";
import { toast } from "sonner";

const Settings = () => {
  // Business settings
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  
  // App settings
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);
  
  // Currency settings
  const [defaultCurrency, setDefaultCurrency] = useState("USD");
  const [goldUnit, setGoldUnit] = useState("grams");
  
  useEffect(() => {
    // Load settings from localStorage
    const settings = localStorageService.settings.getSettings() || {};
    
    // Business settings
    setBusinessName(settings.businessName || "");
    setOwnerName(settings.ownerName || "");
    setContactNumber(settings.contactNumber || "");
    setEmail(settings.email || "");
    
    // App settings
    setDarkMode(settings.darkMode || false);
    setNotifications(settings.notifications !== false);
    setAutoBackup(settings.autoBackup !== false);
    
    // Currency settings
    setDefaultCurrency(settings.defaultCurrency || "USD");
    setGoldUnit(settings.goldUnit || "grams");
  }, []);
  
  const saveSettings = (settingType: string) => {
    // Get current settings
    const currentSettings = localStorageService.settings.getSettings() || {};
    
    // Update based on setting type
    let newSettings = { ...currentSettings };
    
    if (settingType === "business") {
      newSettings = {
        ...newSettings,
        businessName,
        ownerName,
        contactNumber,
        email
      };
    } else if (settingType === "app") {
      newSettings = {
        ...newSettings,
        darkMode,
        notifications,
        autoBackup
      };
    } else if (settingType === "currency") {
      newSettings = {
        ...newSettings,
        defaultCurrency,
        goldUnit
      };
    }
    
    // Save settings
    localStorageService.settings.saveSettings(newSettings);
    
    // Show success message
    toast.success("Settings saved successfully");
  };
  
  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold text-amber-800 mb-6">Settings</h1>
        
        <Tabs defaultValue="business" className="space-y-4">
          <TabsList>
            <TabsTrigger value="business">Business</TabsTrigger>
            <TabsTrigger value="app">Application</TabsTrigger>
            <TabsTrigger value="currency">Currency & Units</TabsTrigger>
          </TabsList>
          
          <TabsContent value="business">
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>
                  These details will appear on your reports and invoices
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Enter business name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ownerName">Owner Name</Label>
                  <Input
                    id="ownerName"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Enter owner name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contactNumber">Contact Number</Label>
                  <Input
                    id="contactNumber"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="Enter contact number"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                  />
                </div>
                
                <Button 
                  onClick={() => saveSettings("business")}
                  className="bg-amber-500 hover:bg-amber-600"
                >
                  Save Business Information
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="app">
            <Card>
              <CardHeader>
                <CardTitle>Application Settings</CardTitle>
                <CardDescription>
                  Customize your application experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="darkMode" className="text-base">Dark Mode</Label>
                    <p className="text-sm text-gray-500">
                      Enable dark color scheme
                    </p>
                  </div>
                  <Switch
                    id="darkMode"
                    checked={darkMode}
                    onCheckedChange={setDarkMode}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notifications" className="text-base">Notifications</Label>
                    <p className="text-sm text-gray-500">
                      Show system notifications
                    </p>
                  </div>
                  <Switch
                    id="notifications"
                    checked={notifications}
                    onCheckedChange={setNotifications}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="autoBackup" className="text-base">Automatic Backup</Label>
                    <p className="text-sm text-gray-500">
                      Backup data automatically when closing
                    </p>
                  </div>
                  <Switch
                    id="autoBackup"
                    checked={autoBackup}
                    onCheckedChange={setAutoBackup}
                  />
                </div>
                
                <Button 
                  onClick={() => saveSettings("app")}
                  className="bg-amber-500 hover:bg-amber-600"
                >
                  Save App Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="currency">
            <Card>
              <CardHeader>
                <CardTitle>Currency & Measurement Settings</CardTitle>
                <CardDescription>
                  Set your preferred currency and measurement units
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultCurrency">Default Currency</Label>
                  <select
                    id="defaultCurrency"
                    value={defaultCurrency}
                    onChange={(e) => setDefaultCurrency(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                    <option value="AUD">AUD - Australian Dollar</option>
                    <option value="INR">INR - Indian Rupee</option>
                    <option value="AED">AED - UAE Dirham</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="goldUnit">Gold Weight Unit</Label>
                  <select
                    id="goldUnit"
                    value={goldUnit}
                    onChange={(e) => setGoldUnit(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="grams">Grams</option>
                    <option value="ounces">Troy Ounces</option>
                    <option value="tola">Tola</option>
                    <option value="baht">Baht</option>
                  </select>
                </div>
                
                <Button 
                  onClick={() => saveSettings("currency")}
                  className="bg-amber-500 hover:bg-amber-600"
                >
                  Save Currency Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Settings;
