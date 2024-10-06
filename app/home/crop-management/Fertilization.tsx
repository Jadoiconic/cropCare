import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import Ibirayi from '@/components/Ibirayi';
import Maize from '@/components/Maize';

const Fertilization = () => {
    const [activeTab, setActiveTab] = React.useState<'maize' | 'ibirayi'>('maize');

    return (
        <View style={styles.container}>
            {/* Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'maize' && styles.activeTab]}
                    onPress={() => setActiveTab('maize')}
                >
                    <Text style={[styles.tabText, activeTab === 'maize' && styles.activeTabText]}>IBIGORI</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === 'ibirayi' && styles.activeTab]}
                    onPress={() => setActiveTab('ibirayi')}
                >
                    <Text style={[styles.tabText, activeTab === 'ibirayi' && styles.activeTabText]}>IBIRAYI</Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.contentContainer}>
                {activeTab === 'maize' ? <Maize /> : <Ibirayi />}
            </View>
        </View>
    );
}

export default Fertilization;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    activeTab: {
        backgroundColor: '#4CAF50',
    },
    tabText: {
        fontSize: 16,
        color: '#555',
    },
    activeTabText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    contentContainer: {
        padding: 16,
        flex: 1,
    },
});
