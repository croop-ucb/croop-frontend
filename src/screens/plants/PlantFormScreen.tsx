import React, { useState } from 'react';
import {
  StyleSheet, View, Text, TextInput, TouchableOpacity,
  SafeAreaView, StatusBar, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import ScreenBackground from '../../components/ScreenBackground';

type Props = NativeStackScreenProps<RootStackParamList, 'PlantForm'>;

const PORTES = ['Pequeno', 'Médio', 'Grande'];
const AMBIENTES = ['Sol Pleno', 'Meia-Sombra', 'Sombra'];

export default function PlantFormScreen({ navigation, route }: Props) {
  const plantId = route.params?.plantId;
  const isEditing = Boolean(plantId);

  const [nome, setNome] = useState('');
  const [especie, setEspecie] = useState('');
  const [porte, setPorte] = useState('');
  const [ambiente, setAmbiente] = useState('');

  const handleSave = () => {
    navigation.goBack();
  };

  return (
    <ScreenBackground overlayOpacity={0.8}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />

        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={26} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditing ? 'Editar Planta' : 'Nova Planta'}
          </Text>
          <View style={styles.headerRight} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.form}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.label}>Nome da planta *</Text>
            <TextInput
              style={styles.input}
              value={nome}
              onChangeText={setNome}
              placeholder="Ex: Espada de São Jorge"
              placeholderTextColor="rgba(255,255,255,0.4)"
            />

            <Text style={styles.label}>Espécie</Text>
            <TextInput
              style={styles.input}
              value={especie}
              onChangeText={setEspecie}
              placeholder="Ex: Sansevieria trifasciata"
              placeholderTextColor="rgba(255,255,255,0.4)"
            />

            <Text style={styles.label}>Porte *</Text>
            <View style={styles.optionsRow}>
              {PORTES.map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.optionBtn, porte === p && styles.optionBtnActive]}
                  onPress={() => setPorte(p)}
                >
                  <Text style={[styles.optionText, porte === p && styles.optionTextActive]}>
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Ambiente *</Text>
            <View style={styles.optionsRow}>
              {AMBIENTES.map((a) => (
                <TouchableOpacity
                  key={a}
                  style={[styles.optionBtn, ambiente === a && styles.optionBtnActive]}
                  onPress={() => setAmbiente(a)}
                >
                  <Text style={[styles.optionText, ambiente === a && styles.optionTextActive]}>
                    {a}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>
                {isEditing ? 'Salvar alterações' : 'Cadastrar planta'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, marginTop: 10, height: 60,
  },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, color: '#FFF', fontSize: 20, fontWeight: '300', textAlign: 'center' },
  headerRight: { width: 34 },
  form: { paddingHorizontal: 30, paddingTop: 20, paddingBottom: 60 },
  label: { color: '#4CAF50', fontSize: 15, fontWeight: 'bold', marginBottom: 8, marginTop: 16 },
  input: {
    width: '100%', height: 50, backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16, paddingHorizontal: 16, color: '#FFF', fontSize: 15,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  optionBtn: {
    paddingVertical: 10, paddingHorizontal: 18, borderRadius: 20,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  optionBtnActive: { borderColor: '#4CAF50', backgroundColor: 'rgba(76,175,80,0.15)' },
  optionText: { color: '#CCC', fontSize: 14 },
  optionTextActive: { color: '#4CAF50', fontWeight: 'bold' },
  saveBtn: {
    marginTop: 36, backgroundColor: '#4CAF50', paddingVertical: 16,
    borderRadius: 25, alignItems: 'center', justifyContent: 'center',
  },
  saveBtnText: { color: '#FFF', fontSize: 17, fontWeight: 'bold' },
});
