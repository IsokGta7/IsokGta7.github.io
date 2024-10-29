---
layout: default
title: Numbers IA
permalink: /numbersMarkdown/
---

# Proyecto Numbers: Detección de Números con una CNN

## Introducción

El proyecto **Numbers** es una aplicación web que permite a los usuarios dibujar números en un canvas. Estos dibujos son procesados y enviados a un modelo de aprendizaje profundo en TensorFlow.js para predecir el número. Para realizar esta tarea, utilizamos una **Convolutional Neural Network (CNN)**, que es especialmente útil para el reconocimiento de imágenes, como en este caso donde queremos identificar qué número ha sido dibujado.

En este documento explicaremos a detalle cómo funciona una CNN y cómo fue aplicada en este proyecto para el reconocimiento de números manuscritos.

## ¿Qué es una CNN?

Una **Convolutional Neural Network (CNN)** es un tipo de red neuronal que se especializa en el procesamiento de datos que tienen una estructura de grilla, como las imágenes. En lugar de procesar cada píxel de forma individual, una CNN aprende a identificar características clave en grupos de píxeles. 

### Principales Componentes de una CNN

1. **Capas Convolucionales:** Estas capas son responsables de extraer características de las imágenes. En cada capa, se aplican filtros que recorren la imagen, creando mapas de características. Cada filtro detecta diferentes características como bordes, texturas o formas.

2. **ReLU (Rectified Linear Unit):** Una función de activación no lineal que se aplica después de cada convolución. Introduce no linealidad en el modelo, permitiéndole aprender relaciones más complejas.

3. **Capa de Pooling:** Reduce el tamaño de los mapas de características, manteniendo las más importantes. Esto hace que el modelo sea más eficiente y menos propenso al sobreajuste.

4. **Capas Completamente Conectadas:** Después de extraer y reducir las características, estas capas las utilizan para tomar una decisión final, en este caso, clasificar qué número es el dibujado.

## Aplicación en el Proyecto

En **Numbers**, cuando el usuario dibuja un número en el canvas, este dibujo es capturado como una imagen. El proceso es el siguiente:

1. **Captura del Dibujo:** El número dibujado se convierte en una matriz de dimensiones `28x28`, lo que significa que la imagen es reducida a una resolución de 28 píxeles por 28 píxeles.

2. **Normalización:** Los valores de los píxeles de la imagen se normalizan para estar entre 0 y 1, lo cual facilita el entrenamiento y la predicción de la CNN.

3. **Reshape de la Imagen:** La imagen es reestructurada a una matriz con dimensiones `1x28x28x1`, donde:
   - `1` indica que estamos procesando una sola imagen.
   - `28x28` son las dimensiones de la imagen.
   - `1` indica que la imagen es en escala de grises (sin canales de color).

4. **Predicción con TensorFlow.js:** La matriz es pasada al modelo de CNN que hemos entrenado previamente utilizando la librería de **TensorFlow.js**. Este modelo realiza la predicción y devuelve el número que más probablemente fue dibujado.


## ¿Cómo Funciona la CNN en TensorFlow.js?

El modelo utilizado en este proyecto es una **CNN preentrenada** que se ha desarrollado utilizando **Keras** y se exportó para su uso en **TensorFlow.js**. Este modelo fue entrenado en el conjunto de datos **MNIST**, que contiene 70,000 imágenes de números manuscritos. Este dataset es ideal para entrenar una CNN en la tarea de reconocimiento de números, ya que ofrece gran variedad y diversidad en los trazos y estilos de escritura.

### Arquitectura de la CNN
La arquitectura del modelo CNN es la siguiente:

- **Capa Convolucional 1:** 32 filtros, tamaño de kernel de 3x3, activación ReLU.
- **Capa de MaxPooling:** Tamaño de ventana 2x2.
- **Capa Convolucional 2:** 64 filtros, tamaño de kernel de 3x3, activación ReLU.
- **Capa de MaxPooling:** Tamaño de ventana 2x2.
- **Capa Completamente Conectada:** 128 unidades, activación ReLU.
- **Capa de Salida:** 10 unidades (una para cada dígito), activación softmax.

Esta arquitectura permite que el modelo identifique patrones complejos en las imágenes de números y realice predicciones con gran precisión.

## Conclusión

El proyecto **Numbers** demuestra el poder de las CNN en el reconocimiento de imágenes, especialmente en la identificación de números manuscritos. A través de técnicas avanzadas como la convolución y el pooling, el modelo es capaz de analizar los trazos y patrones presentes en las imágenes y realizar predicciones precisas. Este proyecto también muestra cómo **TensorFlow.js** permite la integración de modelos de aprendizaje profundo en aplicaciones web, lo que abre nuevas posibilidades para la creación de aplicaciones interactivas y educativas.

