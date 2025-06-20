import React, { useState } from 'react';
import { useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native'; 
import { doc, setDoc,collection,deleteDoc,getDoc,getDocs } from "firebase/firestore";
import {db} from './dbConfig';
import AntDesign from '@expo/vector-icons/AntDesign';


export default function HomeScreen({ navigation }) {

  
  const [isAdmin, setIsAdmin] = useState(false);

  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState({});
  const [showMenu, setShowMenu] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [marcaSelecionada, setMarcaSelecionada] = useState(null);
  const [produtos, setProdutos] = useState([]);
  

  function ler(){

    getDocs(collection(db,"Produtos")).then(docSnap =>{
      const lista = [];
      docSnap.forEach((doc)=>{

        lista.push({...doc.data(),id:doc.id})

      })
      setProdutos(lista);
      console.log(lista);
      
    })
    
  }
  useEffect(() => {
    ler();
  }, []);

  async function deletar(nome){
    await deleteDoc(doc(db, "Produtos", nome));

  }


  useEffect(
    React.useCallback(() => {
      const verificarAdmin = async () => {
        const valor = await AsyncStorage.getItem('adminLogado');
        if(valor === "true"){
          setIsAdmin(true);
        }
        else{
          setIsAdmin(false)
        }
        
      };

      verificarAdmin();
    }, [])
  );

  

const normalize = (text) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const filtered = produtos.filter((p) => {
  const searchNormalized = normalize(search);
  const matchSearch =
    (p.nome && normalize(p.nome).includes(searchNormalized)) ||
    (p.marca && normalize(p.marca).includes(searchNormalized));

  const matchMarca = !marcaSelecionada || normalize(p.marca) === normalize(marcaSelecionada);

  // Se estiver pesquisando, ignora o filtro de marca
  return searchNormalized ? matchSearch : matchSearch && matchMarca;
});

  const handleSelectSize = (productId, size) => {
    setSelectedSizes({ ...selectedSizes, [productId]: size });
  };

  const handleAddToCart = (item) => {
    const tamanho = selectedSizes[item.id];
    if (!tamanho) {
      alert('Selecione um tamanho antes de adicionar ao carrinho.');
      return;
    }
    const itemComTamanho = { ...item, tamanho, imagem: item.imagens[0] };
    setCart([...cart, itemComTamanho]);
  };

  const handleOpenModal = (product) => {
    setCurrentProduct(product);
    setCurrentImageIndex(0);
    setModalVisible(true);
  };

  const handleNextImage = () => {
    if (
      currentProduct &&
      currentImageIndex < currentProduct.imagens.length - 1
    ) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const handlePreviousImage = () => {
    if (currentProduct && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const renderSizes = (productId) => {
    const tamanhos = ['P', 'M', 'G', 'GG'];
    return (
      <View style={styles.tamanhosContainer}>
        {tamanhos.map((t) => (
          <TouchableOpacity
            key={t}
            style={[
              styles.tamanhoBotao,
              selectedSizes[productId] === t && styles.tamanhoSelecionado,
            ]}
            onPress={() => handleSelectSize(productId, t)}>
            <Text style={styles.tamanhoTexto}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.produtoContainer}>
      <TouchableOpacity onPress={() => handleOpenModal(item)}>
        <Image source={{ uri: item.imagens[0] }} style={styles.imagemProduto} />
      </TouchableOpacity>
      <View style={styles.infoProduto}>
        <Text style={styles.nome}>{item.id}</Text>
        <Text style={styles.marca}>{item.marca}</Text>
        <Text style={styles.preco}>{item.preco}</Text>

        {renderSizes(item.id)}

        {!isAdmin && (
          
          <TouchableOpacity
            style={styles.botaoCarrinho}
            onPress={() => handleAddToCart(item)}>
            <Ionicons name="cart" size={24} color="black" />
          </TouchableOpacity>  
        )}

        {isAdmin && (
          
          <TouchableOpacity
            style={styles.botaoCarrinho}
            onPress={() => deletar(item.id)}>
            <AntDesign name="minuscircle" size={24} color="black" />
          </TouchableOpacity>
          
        )}

      </View>
    </View>
  );

  return (
    <ImageBackground
      source={{ uri: 'https://i.postimg.cc/HW7MWNP7/temp-Imageqgq4-A6.avif' }}
      style={styles.backgroundImage}
      imageStyle={{ opacity: 0.08 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setShowMenu(!showMenu)}>
          <Ionicons name="menu" size={28} color="#000" />
        </TouchableOpacity>
        <Image source={require('./assets/Imagem2.png')} style={styles.logo} />

        {!isAdmin && (
          <TouchableOpacity
            onPress={() => navigation.navigate('Cart', { cartItems: cart })}>
            <View style={styles.cartContainer}>
              <Ionicons name="cart" size={28} color="#000" />
              {cart.length > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cart.length}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
        {isAdmin && (
          
          <TouchableOpacity
            onPress={() => navigation.navigate("Admin")}>
            <View style={styles.cartContainer}>
              <AntDesign name="pluscircle" size={24} color="black" />
              
            </View>
          </TouchableOpacity>
          
        )}

        
      </View>

      {showMenu && (
        <View style={styles.drawerMenu}>
          

          {!isAdmin && (
            <TouchableOpacity
              onPress={async () => {
                setShowMenu(false);
                navigation.navigate('Login');
                
              }}
            >  
              <Text style={styles.menuItem}>Admin</Text>
            </TouchableOpacity>
          )}


          
          
          {isAdmin && (

            <TouchableOpacity
              onPress={async () => {
                setShowMenu(false);
                await AsyncStorage.setItem('adminLogado','false');
                
              }}
            >  
              <Text style={styles.menuItem}>SAIR</Text>
            </TouchableOpacity>
          )}
          


        </View>
      )}

      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#000"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="O que procura?"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filtro por marcas */}
      <View style={{ marginBottom: 20 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ paddingHorizontal: 20 }}>
          <TouchableOpacity onPress={() => setMarcaSelecionada('ADIDAS')}>
            <Image
              source={require('./assets/adidas.png')}
              style={[
                styles.marcaLogo,
                marcaSelecionada === 'ADIDAS' && styles.logoSelecionada,
              ]}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMarcaSelecionada('JORDAN')}>
            <Image
              source={require('./assets/jordan.png')}
              style={[
                styles.marcaLogo,
                marcaSelecionada === 'JORDAN' && styles.logoSelecionada,
              ]}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setMarcaSelecionada('NEW BALANCE')}>
            <Image
              source={require('./assets/newbalance.png')}
              style={[
                styles.marcaLogo,
                marcaSelecionada === 'NEW BALANCE' && styles.logoSelecionada,
              ]}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMarcaSelecionada('REEBOK')}>
            <Image
              source={require('./assets/reebok.png')}
              style={[
                styles.marcaLogo,
                marcaSelecionada === 'REEBOK' && styles.logoSelecionada,
              ]}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setMarcaSelecionada('NIKE')}>
            <Image
              source={require('./assets/nike.png')}
              style={[
                styles.marcaLogo,
                marcaSelecionada === 'NIKE' && styles.logoSelecionada,
              ]}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setMarcaSelecionada('PUMA')}>
            <Image
              source={require('./assets/puma.png')}
              style={[
                styles.marcaLogo,
                marcaSelecionada === 'PUMA' && styles.logoSelecionada,
              ]}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMarcaSelecionada('KAPPA')}>
            <Image
              source={require('./assets/kappa.png')}
              style={[
                styles.marcaLogo,
                marcaSelecionada === 'KAPPA' && styles.logoSelecionada,
              ]}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMarcaSelecionada('UMBRO')}>
            <Image
              source={require('./assets/umbro.png')}
              style={[
                styles.marcaLogo,
                marcaSelecionada === 'UMBRO' && styles.logoSelecionada,
              ]}
            />
          </TouchableOpacity>
        </ScrollView>
      </View>

      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listaProdutos}
      />

      {modalVisible && currentProduct && (
        <Modal transparent animationType="fade" visible={modalVisible}>
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  <View style={styles.modalNavigation}>
                    <TouchableOpacity onPress={handlePreviousImage}>
                      <Ionicons
                        name="arrow-back-circle"
                        size={36}
                        color="white"
                      />
                    </TouchableOpacity>

                    <Image
                      source={{ uri: currentProduct.imagens[currentImageIndex] }}
                      style={styles.modalImage}
                    />

                    <TouchableOpacity onPress={handleNextImage}>
                      <Ionicons
                        name="arrow-forward-circle"
                        size={36}
                        color="white"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: { flex: 1 },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: { width: 80, height: 80, resizeMode: 'contain' },
  cartContainer: { position: 'relative' },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'grey',
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  cartBadgeText: { color: 'white', fontSize: 14, fontWeight: 'bold' },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#eee',
    margin: 20,
    borderRadius: 10,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 40 },
  listaProdutos: { paddingHorizontal: 20 },
  produtoContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 10,
  },
  imagemProduto: {
    width: 100,
    height: 140,
    resizeMode: 'cover',
    borderRadius: 8,
  },
  infoProduto: { flex: 1, marginLeft: 15 },
  marca: { fontWeight: 'bold', fontSize: 14 },
  nome: { fontWeight: 'bold',fontSize: 13, color: '#444' },
  preco: { fontWeight: 'bold', fontSize: 16, marginTop: 4 },
  tamanhosContainer: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  tamanhoBotao: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  tamanhoSelecionado: {
    backgroundColor: '#ddd',
    borderColor: '#000',
  },
  tamanhoTexto: { fontSize: 14 },
  botaoCarrinho: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  drawerMenu: {
    position: 'absolute',
    top: 110,
    left: 20,
    backgroundColor: 'transparent',
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    zIndex: 10,
  },
  menuItem: { fontSize: 16, fontWeight: 'bold' },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  modalContent: {
    backgroundColor: 'transparent',
    borderRadius: 10,
    padding: 20,
  },
  modalNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  modalImage: {
    width: 300,
    height: 400,
    resizeMode: 'contain',
  },
  marcaLogo: {
    width: 60,
    height: 60,
    marginRight: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
    resizeMode: 'contain',
  },
});
