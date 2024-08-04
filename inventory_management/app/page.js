'use client';
import Image from "next/image";
import { useState, useEffect} from 'react';
import {firestore, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, auth} from '@/firebase';
import {Box, Typography, Modal, Stack, TextField, Button, MenuItem, Select, InputLabel, FormControl, IconButton, Dialog, DialogActions, DialogContent, DialogTitle, Alert, Container, Grid, InputAdornment} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { collection, getDoc, getDocs, query, doc, deleteDoc, setDoc,} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function Home() 
{
  const [inventory, setInventory]= useState([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [editItem, setEditItem] = useState(null);
  const [newQuantity, setNewQuantity] = useState(0);
  const [sortedInventory, setSortedInventory] = useState([]);

  //user authentication
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [shouldUpdateInventory, setShouldUpdateInventory] = useState(false);
  const [emailPlaceholder, setEmailPlaceholder] = useState('Email');
  const [passwordPlaceholder, setPasswordPlaceholder] = useState('Password');

 

  const updateInventory = async () => {
    if (user) {
      const userId = user.uid;
      const snapshot = query(collection(firestore, `users/${userId}/inventory`));
      const docs = await getDocs(snapshot);
      const inventoryList = [];
      docs.forEach((doc) => {
        inventoryList.push({
          name: doc.id,
          ...doc.data(),
        });
      });
      setInventory(inventoryList);
    }
  };

  const addItem = async (item) =>{
    if (user) {
      const userId = user.uid;
      const capitalizedItem = item.charAt(0).toUpperCase() + item.slice(1);
      const docRef = doc(collection(firestore, `users/${userId}/inventory`), capitalizedItem);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const { quantity } = docSnap.data();
        await setDoc(docRef, { quantity: quantity + 1 });
      } else {
        await setDoc(docRef, { quantity: 1 });
      }

      await updateInventory();
    }
  } 
  
  const removeItem = async (item) =>{
    if (user) {
      const userId = user.uid;
      const docRef = doc(collection(firestore, `users/${userId}/inventory`), item);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const { quantity } = docSnap.data();
        if (quantity === 1) {
          await deleteDoc(docRef);
        } else {
          await setDoc(docRef, { quantity: quantity - 1 });
        }
      }

      await updateInventory();
    }
  };

  const handleEdit = async () => {
    if (user) {
      const userId = user.uid;
      const capitalizedItem = editItem.charAt(0).toUpperCase() + editItem.slice(1);
      const docRef = doc(collection(firestore, `users/${userId}/inventory`), capitalizedItem);
      await setDoc(docRef, { quantity: newQuantity });
      setEditOpen(false);
      setNewQuantity(0);
      await updateInventory();
    }
  }

  useEffect(() => {
    const fetchUserData = async (user) => {
      if (user) {
        try {
          const docRef = doc(firestore, `users/${user.uid}`);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserName(docSnap.data().name); // Fetch the user's name
          }
        } catch (error) {
          console.error("Error fetching user data: ", error);
        }
      }
    };

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      await fetchUserData(user); // Call the async function
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (shouldUpdateInventory) {
      updateInventory();
      setShouldUpdateInventory(false);
    }
  }, [shouldUpdateInventory, user]);
  

  useEffect(() => {
    if (inventory.length > 0) {
      const sortedInventory = [...inventory].sort((a, b) => {
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        } else if (sortBy === 'quantity') {
          return b.quantity - a.quantity;
        }
        return 0;
      });
      setSortedInventory(sortedInventory);
    }
  }, [sortBy, inventory]);

  const deleteItem = async (item) => {
    if (user) {
      const userId = user.uid;
      const docRef = doc(collection(firestore, `users/${userId}/inventory`), item);
      await deleteDoc(docRef);
      await updateInventory();
    }
  }

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  
  const handleEditOpen = (item, quantity) => {
    setEditItem(item);
    setNewQuantity(quantity);
    setEditOpen(true);
  }
  const handleEditClose = () => {
    setEditOpen(false);
    setNewQuantity(0);
  }

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSignUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(firestore, `users/${user.uid}`), {
        email: user.email,
        name: userName, // Add this line to store the user's name
      });
      setEmail('');
      setPassword('');
      setAuthError('');
    } catch (error) {
      setAuthError('Error signing up: ' + error.message);
    }
  };

  const handleSignIn = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      setEmail('');
      setPassword('');
      setAuthError('');
      setShouldUpdateInventory(true);

    } catch (error) {
      setAuthError('Error signing in: ' + error.message);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setAuthError('');
    } catch (error) {
      setAuthError('Error signing out: ' + error.message);
    }
  };

  useEffect(() => {
    console.log('Firestore:', firestore);
    console.log('Auth:', auth);
  }, []);


  return (
<Container maxWidth="md" sx={{ mt: 4, bgcolor: '#F9F9F9', borderRadius: '16px', p: 4, boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)' }}>
  <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
    <Typography variant="h4" align="center" gutterBottom sx={{ color: '#FF6F61', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>
      Inventory Management App
    </Typography>
    {authError && <Alert severity="error">{authError}</Alert>}
    {!user ? (
      <Stack spacing={2} width="100%" maxWidth="400px">
        <Typography variant="h5" align="center">Sign In</Typography>
        <TextField
          placeholder={emailPlaceholder}
          variant="outlined"
          fullWidth
          value={email}
          onFocus={() => setEmailPlaceholder('')}
          onBlur={() => setEmailPlaceholder('Email')}
          onChange={(e) => setEmail(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              background: '#FFFFFF',
              '& fieldset': {
                borderColor: '#FF6F61',
              },
              '&:hover fieldset': {
                borderColor: '#FF3F5C',
              },
            },
            '& .MuiInputBase-input': {
              fontFamily: 'Arial, sans-serif',
              color: '#333',
            },
          }}
        />
        <TextField
          placeholder={passwordPlaceholder}
          variant="outlined"
          type="password"
          fullWidth
          value={password}
          onFocus={() => setPasswordPlaceholder('')}
          onBlur={() => setPasswordPlaceholder('Password')}
          onChange={(e) => setPassword(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              background: '#FFFFFF',
              '& fieldset': {
                borderColor: '#FF6F61',
              },
              '&:hover fieldset': {
                borderColor: '#FF3F5C',
              },
            },
            '& .MuiInputBase-input': {
              fontFamily: 'Arial, sans-serif',
              color: '#333',
            },
          }}
        />
        <Button variant="contained" color="primary" fullWidth onClick={handleSignUp}
        sx={{
          background: '#FF6F61',
          color: '#FFF',
          borderRadius: '12px',
          textTransform: 'none',
          transition: 'background 0.3s ease',
          '&:hover': {
            background: '#FF3F5C',
          },
        }}
        >Sign Up</Button>
        <Button variant="contained" color="secondary" fullWidth onClick={handleSignIn}
        sx={{
          backgroundColor: '#FF8A80',
          color: '#FFF',
          '&:hover': {
            backgroundColor: '#FF6D6D',
          },
          borderRadius: '12px',
          textTransform: 'none',
        }}
        >Sign In</Button>
      </Stack>
    ) : (
      <>
        <Stack spacing={2} width="100%" maxWidth="400px" mb={4}>
          <Typography variant="h5" align="center">Welcome</Typography>
          <Button variant="contained" color="error" fullWidth onClick={handleSignOut}>Sign Out</Button>
        </Stack>

        <Modal open={open} onClose={handleClose}>
          <Box
            position="absolute"
            top="50%"
            left="50%"
            width="400px"
            bgcolor="#FFF"
            borderRadius="16px"
            boxShadow="0px 4px 12px rgba(0, 0, 0, 0.1)"
            p={4}
            display="flex"
            flexDirection="column"
            gap={3}
            sx={{ transform: 'translate(-50%, -50%)' }}
          >
            <Typography variant="h6" gutterBottom sx={{fontFamily: 'Arial, sans-serif', color: '#FF6F61'}}>Add Item</Typography>
            <Stack width="100%" direction="row" spacing={2}>
              <TextField
                variant="outlined"
                fullWidth
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="Item name"
              />
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  addItem(itemName);
                  setItemName('');
                  handleClose();
                }}
                sx={{ background: '#FF6F61', '&:hover': { background: '#FF3F5C' } }}
              >
                Add
              </Button>
            </Stack>
          </Box>
        </Modal>

        <Dialog open={editOpen} onClose={handleEditClose}>
          <DialogTitle sx={{ fontFamily: 'Arial, sans-serif', color: '#FF6F61' }}>Edit Quantity</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label={newQuantity === 0 ? "New Quantity" : ""}
              type="number"
              fullWidth
              variant="outlined"
              value={newQuantity}
              onChange={(e) => setNewQuantity(parseInt(e.target.value))}
              sx={{ fontFamily: 'Arial, sans-serif', '& .MuiOutlinedInput-root': { background: '#FFF' } }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditClose}>Cancel</Button>
            <Button onClick={handleEdit} color="primary">Save</Button>
          </DialogActions>
        </Dialog>

        <Stack direction="row" spacing={2} mb={2} width="100%" sx={{ justifyContent: 'center', alignItems: 'center' }}>
          <Button variant="contained" color="primary" onClick={handleOpen} startIcon={<AddIcon />} sx={{ background: '#FF6F61', '&:hover': { background: '#FF3F5C' } }}>Add Item</Button>
          <FormControl variant="outlined" size="small">
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              label="Sort By"
            >
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="quantity">Quantity</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        <TextField
          variant="outlined"
          fullWidth
          placeholder="Search items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
        />

        <Grid container spacing={2}>
          {filteredInventory.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.name}>
              <Box
                border="1px solid"
                borderColor="divider"
                borderRadius="12px"
                p={2}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                sx={{ 
                  bgcolor: '#FFF',
                  boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.1)',
                  },                    
                }}
              >
                <Typography variant="body1" sx={{ fontFamily: 'Arial, sans-serif', color: '#FF6F61' }}>{item.name}</Typography>
                <Stack direction="row" spacing={1}>
                  <IconButton color="primary" onClick={() => handleEditOpen(item.name, item.quantity)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="success" onClick={() => addItem(item.name)}>
                    <AddIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => removeItem(item.name)}>
                    <RemoveIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => deleteItem(item.name)}>
                    <DeleteIcon />
                  </IconButton>
                </Stack>
                <Typography variant="body2" color="text.secondary">{item.quantity}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </>
    )}
  </Box>
</Container>

  );
}