import React, { useState, useEffect } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageBackground,
  FlatList,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { doc, setDoc } from "firebase/firestore";
import {db} from './dbConfig'; 
 

export default function AdminScreen({ navigation }) {
  const [produtos, setProdutos] = useState([]);
  const [nome, setNome] = useState('');
  const [marca, setMarca] = useState('');
  const [preco, setPreco] = useState('');
  const [imagens, setImagens] = useState([]);
  const [editando, setEditando] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const uploadParaCloudinary = async (imagemUri) => {
    const data = new FormData();
    data.append('file', {
      uri: imagemUri,
      type: 'image/jpeg',
      name: 'upload.jpg',
    });
    data.append('upload_preset', 'default'); // crie isso no Cloudinary
    data.append('cloud_name', 'dkrjnyyqi');

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/dkrjnyyqi/image/upload`, {
        method: 'POST',
        body: data,
      });

      const result = await response.json();
      return result.secure_url; // URL da imagem hospedada
    } catch (error) {
      console.error('Erro ao enviar para Cloudinary:', error);
      return null;
    }
  };  


  async function criar(nome1, marca1, preco1, imagensSelecionadas) {
    try {
      const urlsImagens = [];

      for (const uri of imagensSelecionadas) {
        const url = await uploadParaCloudinary(uri);
        if (url) {
          urlsImagens.push(url);
        }
      }

      await setDoc(doc(db, "Produtos", nome1), {
        nome: nome1,
        marca: marca1,
        preco: preco1,
        imagens: urlsImagens,
      });

      Alert.alert('Sucesso', 'Produto criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      Alert.alert('Erro', 'Não foi possível salvar o produto.');
    }
  }


  useFocusEffect(
    React.useCallback(() => {
      const verificarAdmin = async () => {
        const valor = await AsyncStorage.getItem('adminLogado');
        if(valor === "true"){
          setIsAdmin(true);
        }
        else{
          setIsAdmin(false)
          navigation.navigate("Login")
        }
        
      };

      verificarAdmin();
    }, [])
  );



  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Permita o acesso à galeria para escolher imagens.');
      }
    })();
  }, []);

  const escolherImagens = async () => {
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsMultipleSelection: true,
    });

    if (!resultado.canceled) {
      const novasImagens = resultado.assets.map((img) => img.uri);
      setImagens(novasImagens);
    }
  };

  const limparCampos = () => {
    setNome('');
    setMarca('');
    setPreco('');
    setImagens([]);
    setEditando(null);
  };

  const adicionarOuEditarProduto = () => {
    if (!nome || !marca || !preco || imagens.length === 0) {
      Alert.alert('Erro', 'Preencha todos os campos e escolha ao menos uma imagem');
      return;
    }

    if (editando) {
      setProdutos((prev) =>
        prev.map((item) =>
          item.id === editando ? { ...item, nome, marca, preco, imagens } : item
        )
      );
    } else {
      
      criar(nome,marca,preco,imagens);
    }

    limparCampos();
  };

  const iniciarEdicao = (produto) => {
    setNome(produto.nome);
    setMarca(produto.marca);
    setPreco(produto.preco);
    setImagens(produto.imagens);
    setEditando(produto.id);
  };

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
    
  if (isAdmin) {
  return (
    <ImageBackground
      source={{ uri: 'https://i.postimg.cc/HW7MWNP7/temp-Imageqgq4-A6.avif' }}
      style={styles.backgroundImage}
      imageStyle={{ opacity: 0.08 }}
    >
      
      <View style={styles.topBar}>
        <View style={{ width: 28 }} />
        <View />
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Ionicons name="arrow-forward" size={28} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.logoContainer}>
        <Image source={require('./assets/Imagem2.png')} style={styles.logo} />
      </View>

      <FlatList
        data={produtos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => iniciarEdicao(item)}>
            <View style={styles.produtoItem}>
              <FlatList
                data={item.imagens}
                keyExtractor={(uri, index) => index.toString()}
                horizontal
                renderItem={({ item }) => (
                  <Image source={{ uri: item }} style={styles.produtoImagem} />
                )}
              />
              <Text style={styles.produtoTexto}>{item.nome}</Text>
              <Text style={styles.produtoTexto}>Marca: {item.marca}</Text>
              <Text style={styles.produtoTexto}>R$ {item.preco}</Text>
            </View>
          </TouchableOpacity>
        )}
        style={{ marginTop: 20, paddingHorizontal: 30 }}
        ListHeaderComponent={
          <>
            <Text style={styles.adminTitle}>PRODUTOS</Text>

            <Text style={styles.label}>NOME DO PRODUTO</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Camiseta Nike"
              placeholderTextColor="#999"
              value={nome}
              onChangeText={setNome}
            />

            <Text style={styles.label}>MARCA</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Nike"
              placeholderTextColor="#999"
              value={marca}
              onChangeText={setMarca}
            />

            <Text style={styles.label}>PREÇO</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 80,00 "
              placeholderTextColor="#999"
              value={preco}
              onChangeText={setPreco}
              keyboardType="numeric"
            />

            <TouchableOpacity style={styles.imagePicker} onPress={escolherImagens}>
              <Text style={styles.imagePickerText}>
                {imagens.length > 0 ? 'Imagens Selecionadas' : 'Escolher Imagens'}
              </Text>
            </TouchableOpacity>

            {imagens.length > 0 && (
              <FlatList
                data={imagens}
                keyExtractor={(item, index) => index.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <Image source={{ uri: item }} style={styles.previewImage} />
                )}
                style={{ marginTop: 10 }}
              />
            )}

            <TouchableOpacity style={styles.button} onPress={adicionarOuEditarProduto}>

              
              <Text style={styles.buttonText}>{editando ? 'Salvar' : 'Cadastrar'}</Text>
            </TouchableOpacity>
          </>
        }
      />
    </ImageBackground>
  );
  }

  
}

const styles = StyleSheet.create({
  backgroundImage: { flex: 1 },
  topBar: {
    paddingTop: 60,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: { alignItems: 'center' },
  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginBottom: -10,
  },
  adminTitle: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000',
  },
  label: {
    marginTop: 10,
    fontSize: 14,
    color: '#000',
  },
  input: {
    backgroundColor: '#ccc',
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 15,
    color: '#000',
    marginBottom: 10,
  },
  imagePicker: {
    backgroundColor: '#888',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  imagePickerText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  previewImage: {
    width: 120,
    height: 150,
    borderRadius: 12,
    marginRight: 10,
  },
  button: {
    backgroundColor: '#001400',
    padding: 50,
    borderRadius: 16,
    marginTop: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  produtoItem: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    elevation: 2,
  },
  produtoTexto: { color: '#000' },
  produtoImagem: {
    width: 120,
    height: 150,
    resizeMode: 'cover',
    borderRadius: 10,
    marginRight: 5,
  },
});
