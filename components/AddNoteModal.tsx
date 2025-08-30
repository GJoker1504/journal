import React from 'react';
import { View, Text, TextInput, Pressable, Modal, StyleSheet } from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  onAdd: () => void;
  title: string;
  setTitle: (v: string) => void;
  content: string;
  setContent: (v: string) => void;
  adding: boolean;
  colorTheme: any;
};

export default function AddNoteModal({
  visible, onClose, onAdd, title, setTitle, content, setContent, adding, colorTheme
}: Props) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colorTheme.background }]}>
          <Text style={[styles.modalTitle, { color: colorTheme.text }]}>Добавить заметку</Text>
          <TextInput
            style={[
              styles.input, 
              { borderColor: colorTheme.cardBorder, color: colorTheme.text, backgroundColor: colorTheme.cardBackground }
            ]}
            placeholder="Заголовок"
            placeholderTextColor={colorTheme.text}
            value={title}
            onChangeText={setTitle}
            maxLength={50}
          />
          <TextInput
            style={[
              styles.input, 
              styles.textArea, 
              { borderColor: colorTheme.cardBorder, color: colorTheme.text, backgroundColor: colorTheme.cardBackground }
            ]}
            placeholder="Текст заметки"
            placeholderTextColor={colorTheme.text}
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={4}
            maxLength={500}
          />
          <View style={styles.modalButtons}>
            <Pressable 
              style={[styles.button, styles.cancelButton]} 
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Отмена</Text>
            </Pressable>
            <Pressable 
              style={[
                styles.button, 
                styles.addButton, 
                (!title.trim() || !content.trim()) && styles.disabledButton
              ]}
              onPress={onAdd}
              disabled={!title.trim() || !content.trim() || adding}
            >
              <Text style={styles.buttonText}>
                {adding ? 'Добавление...' : 'Добавить'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { padding: 20, borderRadius: 12, width: '100%', maxWidth: 400 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16 },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  button: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
  cancelButton: { backgroundColor: '#6c757d' },
  addButton: { backgroundColor: '#1890ff' },
  disabledButton: { backgroundColor: '#ccc' },
  buttonText: { color: '#fff', fontWeight: '600' },
});