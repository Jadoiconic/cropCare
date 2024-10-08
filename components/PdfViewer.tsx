// import React, { useEffect, useState } from 'react';
// import { View, ActivityIndicator, StyleSheet } from 'react-native';
// import { Document, Page } from 'react-native-pdf'; // Using react-native-pdf

// const PdfViewer = ({ uri }) => {
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         if (uri) {
//             setLoading(false); // Stop loading once the URI is provided
//         }
//     }, [uri]);

//     if (loading) {
//         return (
//             <View style={styles.loadingContainer}>
//                 <ActivityIndicator size="large" color="green" />
//             </View>
//         );
//     }

//     return (
//         <View style={styles.container}>
//             <Document
//                 source={{ uri }}
//                 onLoadComplete={() => setLoading(false)}
//                 onError={(error) => console.log('Error rendering PDF:', error)}
//                 style={styles.pdf}
//             >
//                 <Page pageNumber={1} />
//             </Document>
//         </View>
//     );
// };

// export default PdfViewer;

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//         backgroundColor: '#fff',
//     },
//     loadingContainer: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     pdf: {
//         flex: 1,
//         width: '100%',
//     },
// });