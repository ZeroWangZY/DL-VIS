"��
�

head.1.bias 

cst1 1Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�

cst2 

cst3 2
ExpandDims"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_loss_fn-SoftmaxCrossEntropyWithLogits/gradSoftmaxCrossEntropyWithLogits*
output_names �
:output*$
input_names �:x�:axis2
 

�3GetNext"Default*7
shared_name(:$57da288c-839f-11ea-ba8a-fa163ec5a4a7*

output_num*
types �'�&�'�$*;
shapes1 �  � ������	 � 2


:

3 

cst4 4tuple_getitem"Default2
 
�

4 

cst5 

cst6 

cst7 5OneHot"\Default/network-TrainOneStepCell/network-WithLossCell/_loss_fn-SoftmaxCrossEntropyWithLogits*
axis���������*
output_names �
:output*J
input_names; �:indices�	:depth�:on_value�:	off_value2	
 
�
H

3 

cst8 6tuple_getitem"Default2
 

�
�
�

6 
 
features.0.features.0.weight 7Conv2D"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/0-Conv2d**
pad_list� �� �*
pad *
pad_mode:same*
mode*
out_channel *
output_names �
:output*
data_format:NCHW*(
stride����*!
input_names �:x�:w**
dilation����*
kernel_size��*
group2
 
 
p
p
�

7 

features.0.features.1.gamma 

features.0.features.1.beta 
%
!features.0.features.1.moving_mean 
)
%features.0.features.1.moving_variance 8FusedBatchNorm"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d*l
output_names\ �:y�:running_mean�:running_variance�:	save_mean�:save_inv_variance*G
input_names8 �:x�	:scale�:b�:mean�:variance*
mode*
momentum-���=*
epsilon-��'72,(





�

8 

cst9 9tuple_getitem"\Default/network-TrainOneStepCell/network-WithLossCell/_loss_fn-SoftmaxCrossEntropyWithLogits2
 
 
p
p
�

9 10ReLU6"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/2-ReLU6*
output_names �
:output*
input_names
 �:x2
 
 
p
p
�

10 
'
#features.1.conv.0.features.0.weight 11DepthwiseConv2dNative"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/1-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/0-DepthWiseConv*&
pads����*
pad *
pad_mode:same*
channel_multiplier*
mode*
data_format:NCHW*(
stride����*!
input_names �:x�:w**
dilation����*
kernel_size*
group*
output_names �
:output2
 
 
p
p
�

11 
&
"features.1.conv.0.features.1.gamma 
%
!features.1.conv.0.features.1.beta 
,
(features.1.conv.0.features.1.moving_mean 
0
,features.1.conv.0.features.1.moving_variance 12FusedBatchNorm"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d*l
output_names\ �:y�:running_mean�:running_variance�:	save_mean�:save_inv_variance*G
input_names8 �:x�	:scale�:b�:mean�:variance*
mode*
momentum-���=*
epsilon-��'72,(





�

12 
	
cst10 13tuple_getitem"\Default/network-TrainOneStepCell/network-WithLossCell/_loss_fn-SoftmaxCrossEntropyWithLogits2
 
 
p
p
�

13 14ReLU6"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/1-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/2-ReLU6*
output_names �
:output*
input_names
 �:x2
 
 
p
p
�

14 

features.1.conv.1.weight 15Conv2D"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/1-InvertedResidual/conv-SequentialCell/1-Conv2d**
pad_list� � � � *
pad *
pad_mode:same*
mode*
out_channel*
output_names �
:output*
data_format:NCHW*(
stride����*!
input_names �:x�:w**
dilation����*
kernel_size��*
group2
 

p
p
�

15 

features.1.conv.2.gamma 

features.1.conv.2.beta 
!
features.1.conv.2.moving_mean 
%
!features.1.conv.2.moving_variance 16FusedBatchNorm"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/1-InvertedResidual/conv-SequentialCell/2-BatchNorm2d*l
output_names\ �:y�:running_mean�:running_variance�:	save_mean�:save_inv_variance*G
input_names8 �:x�	:scale�:b�:mean�:variance*
mode*
momentum-���=*
epsilon-��'72,(





�

16 
	
cst11 17tuple_getitem"\Default/network-TrainOneStepCell/network-WithLossCell/_loss_fn-SoftmaxCrossEntropyWithLogits2
 

p
p
�

17 
'
#features.2.conv.0.features.0.weight 18Conv2D"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/2-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/0-Conv2d**
pad_list� � � � *
pad *
pad_mode:same*
mode*
out_channel`*
output_names �
:output*
data_format:NCHW*(
stride����*!
input_names �:x�:w**
dilation����*
kernel_size��*
group2
 
`
p
p
�

18 
&
"features.2.conv.0.features.1.gamma 
%
!features.2.conv.0.features.1.beta 
,
(features.2.conv.0.features.1.moving_mean 
0
,features.2.conv.0.features.1.moving_variance 19FusedBatchNorm"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/11-InvertedResidual/conv-SequentialCell/3-BatchNorm2d*l
output_names\ �:y�:running_mean�:running_variance�:	save_mean�:save_inv_variance*G
input_names8 �:x�	:scale�:b�:mean�:variance*
mode*
momentum-���=*
epsilon-��'72,(





�

19 
	
cst12 20tuple_getitem"\Default/network-TrainOneStepCell/network-WithLossCell/_loss_fn-SoftmaxCrossEntropyWithLogits2
 
`
p
p
�

20 21ReLU6"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/2-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/2-ReLU6*
output_names �
:output*
input_names
 �:x2
 
`
p
p
�

21 
'
#features.2.conv.1.features.0.weight 22DepthwiseConv2dNative"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/2-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/0-DepthWiseConv*&
pads� �� �*
pad *
pad_mode:same*
channel_multiplier*
mode*
data_format:NCHW*(
stride����*!
input_names �:x�:w**
dilation����*
kernel_size*
group*
output_names �
:output2
 
`
8
8
�

22 
&
"features.2.conv.1.features.1.gamma 
%
!features.2.conv.1.features.1.beta 
,
(features.2.conv.1.features.1.moving_mean 
0
,features.2.conv.1.features.1.moving_variance 23FusedBatchNorm"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/11-InvertedResidual/conv-SequentialCell/3-BatchNorm2d*l
output_names\ �:y�:running_mean�:running_variance�:	save_mean�:save_inv_variance*G
input_names8 �:x�	:scale�:b�:mean�:variance*
mode*
momentum-���=*
epsilon-��'72,(





�

23 
	
cst13 24tuple_getitem"\Default/network-TrainOneStepCell/network-WithLossCell/_loss_fn-SoftmaxCrossEntropyWithLogits2
 
`
8
8
�

24 25ReLU6"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/2-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/2-ReLU6*
output_names �
:output*
input_names
 �:x2
 
`
8
8
�

25 

features.2.conv.2.weight 26Conv2D"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/2-InvertedResidual/conv-SequentialCell/2-Conv2d**
pad_list� � � � *
pad *
pad_mode:same*
mode*
out_channel*
output_names �
:output*
data_format:NCHW*(
stride����*!
input_names �:x�:w**
dilation����*
kernel_size��*
group2
 

8
8
�

26 

features.2.conv.3.gamma 

features.2.conv.3.beta 
!
features.2.conv.3.moving_mean 
%
!features.2.conv.3.moving_variance 27FusedBatchNorm"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/2-InvertedResidual/conv-SequentialCell/3-BatchNorm2d*l
output_names\ �:y�:running_mean�:running_variance�:	save_mean�:save_inv_variance*G
input_names8 �:x�	:scale�:b�:mean�:variance*
mode*
momentum-���=*
epsilon-��'72,(





�

27 
	
cst14 28tuple_getitem"\Default/network-TrainOneStepCell/network-WithLossCell/_loss_fn-SoftmaxCrossEntropyWithLogits2
 

8
8
�

28 
'
#features.3.conv.0.features.0.weight 29Conv2D"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/3-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/0-Conv2d**
pad_list� � � � *
pad *
pad_mode:same*
mode*
out_channel�*
output_names �
:output*
data_format:NCHW*(
stride����*!
input_names �:x�:w**
dilation����*
kernel_size��*
group2
 
�
8
8
�

29 
&
"features.3.conv.0.features.1.gamma 
%
!features.3.conv.0.features.1.beta 
,
(features.3.conv.0.features.1.moving_mean 
0
,features.3.conv.0.features.1.moving_variance 30FusedBatchNorm"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/3-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d*l
output_names\ �:y�:running_mean�:running_variance�:	save_mean�:save_inv_variance*G
input_names8 �:x�	:scale�:b�:mean�:variance*
mode*
momentum-���=*
epsilon-��'72,(





�

30 
	
cst15 31tuple_getitem"\Default/network-TrainOneStepCell/network-WithLossCell/_loss_fn-SoftmaxCrossEntropyWithLogits2
 
�
8
8
�

31 32ReLU6"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/3-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/2-ReLU6*
output_names �
:output*
input_names
 �:x2
 
�
8
8
�

32 
'
#features.3.conv.1.features.0.weight 33DepthwiseConv2dNative"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/3-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/0-DepthWiseConv*&
pads����*
pad *
pad_mode:same*
channel_multiplier*
mode*
data_format:NCHW*(
stride����*!
input_names �:x�:w**
dilation����*
kernel_size*
group*
output_names �
:output2
 
�
8
8
�

33 
&
"features.3.conv.1.features.1.gamma 
%
!features.3.conv.1.features.1.beta 
,
(features.3.conv.1.features.1.moving_mean 
0
,features.3.conv.1.features.1.moving_variance 34FusedBatchNorm"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/3-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d*l
output_names\ �:y�:running_mean�:running_variance�:	save_mean�:save_inv_variance*G
input_names8 �:x�	:scale�:b�:mean�:variance*
mode*
momentum-���=*
epsilon-��'72,(





�

34 
	
cst16 35tuple_getitem"\Default/network-TrainOneStepCell/network-WithLossCell/_loss_fn-SoftmaxCrossEntropyWithLogits2
 
�
8
8
�

35 36ReLU6"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/3-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/2-ReLU6*
output_names �
:output*
input_names
 �:x2
 
�
8
8
�

36 

features.3.conv.2.weight 37Conv2D"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/3-InvertedResidual/conv-SequentialCell/2-Conv2d**
pad_list� � � � *
pad *
pad_mode:same*
mode*
out_channel*
output_names �
:output*
data_format:NCHW*(
stride����*!
input_names �:x�:w**
dilation����*
kernel_size��*
group2
 

8
8
�

37 

features.3.conv.3.gamma 

features.3.conv.3.beta 
!
features.3.conv.3.moving_mean 
%
!features.3.conv.3.moving_variance 38FusedBatchNorm"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/2-InvertedResidual/conv-SequentialCell/3-BatchNorm2d*l
output_names\ �:y�:running_mean�:running_variance�:	save_mean�:save_inv_variance*G
input_names8 �:x�	:scale�:b�:mean�:variance*
mode*
momentum-���=*
epsilon-��'72,(





�

38 
	
cst17 39tuple_getitem"\Default/network-TrainOneStepCell/network-WithLossCell/_loss_fn-SoftmaxCrossEntropyWithLogits2
 

8
8
�

28 

39 40	TensorAdd"vDefault/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/3-InvertedResidual*
output_names �
:output*!
input_names �:x�:y2
 

8
8
�

40 
'
#features.4.conv.0.features.0.weight 41Conv2D"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/3-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/0-Conv2d**
pad_list� � � � *
pad *
pad_mode:same*
mode*
out_channel�*
output_names �
:output*
data_format:NCHW*(
stride����*!
input_names �:x�:w**
dilation����*
kernel_size��*
group2
 
�
8
8
�

41 
&
"features.4.conv.0.features.1.gamma 
%
!features.4.conv.0.features.1.beta 
,
(features.4.conv.0.features.1.moving_mean 
0
,features.4.conv.0.features.1.moving_variance 42FusedBatchNorm"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/3-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d*l
output_names\ �:y�:running_mean�:running_variance�:	save_mean�:save_inv_variance*G
input_names8 �:x�	:scale�:b�:mean�:variance*
mode*
momentum-���=*
epsilon-��'72,(





�

42 
	
cst18 43tuple_getitem"\Default/network-TrainOneStepCell/network-WithLossCell/_loss_fn-SoftmaxCrossEntropyWithLogits2
 
�
8
8
�

43 44ReLU6"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/4-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/2-ReLU6*
output_names �
:output*
input_names
 �:x2
 
�
8
8
�

44 
'
#features.4.conv.1.features.0.weight 45DepthwiseConv2dNative"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/4-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/0-DepthWiseConv*&
pads� �� �*
pad *
pad_mode:same*
channel_multiplier*
mode*
data_format:NCHW*(
stride����*!
input_names �:x�:w**
dilation����*
kernel_size*
group*
output_names �
:output2
 
�


�

45 
&
"features.4.conv.1.features.1.gamma 
%
!features.4.conv.1.features.1.beta 
,
(features.4.conv.1.features.1.moving_mean 
0
,features.4.conv.1.features.1.moving_variance 46FusedBatchNorm"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/3-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d*l
output_names\ �:y�:running_mean�:running_variance�:	save_mean�:save_inv_variance*G
input_names8 �:x�	:scale�:b�:mean�:variance*
mode*
momentum-���=*
epsilon-��'72,(





�

46 
	
cst19 47tuple_getitem"\Default/network-TrainOneStepCell/network-WithLossCell/_loss_fn-SoftmaxCrossEntropyWithLogits2
 
�


�

47 48ReLU6"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/4-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/2-ReLU6*
output_names �
:output*
input_names
 �:x2
 
�


�

48 

features.4.conv.2.weight 49Conv2D"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/4-InvertedResidual/conv-SequentialCell/2-Conv2d**
pad_list� � � � *
pad *
pad_mode:same*
mode*
out_channel *
output_names �
:output*
data_format:NCHW*(
stride����*!
input_names �:x�:w**
dilation����*
kernel_size��*
group2
 
 


�

49 

features.4.conv.3.gamma 

features.4.conv.3.beta 
!
features.4.conv.3.moving_mean 
%
!features.4.conv.3.moving_variance 50FusedBatchNorm"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d*l
output_names\ �:y�:running_mean�:running_variance�:	save_mean�:save_inv_variance*G
input_names8 �:x�	:scale�:b�:mean�:variance*
mode*
momentum-���=*
epsilon-��'72,(





�

50 
	
cst20 51tuple_getitem"\Default/network-TrainOneStepCell/network-WithLossCell/_loss_fn-SoftmaxCrossEntropyWithLogits2
 
 


�

51 
'
#features.5.conv.0.features.0.weight 52Conv2D"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/5-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/0-Conv2d**
pad_list� � � � *
pad *
pad_mode:same*
mode*
out_channel�*
output_names �
:output*
data_format:NCHW*(
stride����*!
input_names �:x�:w**
dilation����*
kernel_size��*
group2
 
�


�

52 
&
"features.5.conv.0.features.1.gamma 
%
!features.5.conv.0.features.1.beta 
,
(features.5.conv.0.features.1.moving_mean 
0
,features.5.conv.0.features.1.moving_variance 53FusedBatchNorm"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/5-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d*l
output_names\ �:y�:running_mean�:running_variance�:	save_mean�:save_inv_variance*G
input_names8 �:x�	:scale�:b�:mean�:variance*
mode*
momentum-���=*
epsilon-��'72,(





�

53 
	
cst21 54tuple_getitem"\Default/network-TrainOneStepCell/network-WithLossCell/_loss_fn-SoftmaxCrossEntropyWithLogits2
 
�


�

54 55ReLU6"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/5-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/2-ReLU6*
output_names �
:output*
input_names
 �:x2
 
�


�

55 
'
#features.5.conv.1.features.0.weight 56DepthwiseConv2dNative"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/5-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/0-DepthWiseConv*&
pads����*
pad *
pad_mode:same*
channel_multiplier*
mode*
data_format:NCHW*(
stride����*!
input_names �:x�:w**
dilation����*
kernel_size*
group*
output_names �
:output2
 
�


�

56 
&
"features.5.conv.1.features.1.gamma 
%
!features.5.conv.1.features.1.beta 
,
(features.5.conv.1.features.1.moving_mean 
0
,features.5.conv.1.features.1.moving_variance 57FusedBatchNorm"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/5-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d*l
output_names\ �:y�:running_mean�:running_variance�:	save_mean�:save_inv_variance*G
input_names8 �:x�	:scale�:b�:mean�:variance*
mode*
momentum-���=*
epsilon-��'72,(





�

57 
	
cst22 58tuple_getitem"\Default/network-TrainOneStepCell/network-WithLossCell/_loss_fn-SoftmaxCrossEntropyWithLogits2
 
�


�

58 59ReLU6"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/5-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/2-ReLU6*
output_names �
:output*
input_names
 �:x2
 
�


�

59 

features.5.conv.2.weight 60Conv2D"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/5-InvertedResidual/conv-SequentialCell/2-Conv2d**
pad_list� � � � *
pad *
pad_mode:same*
mode*
out_channel *
output_names �
:output*
data_format:NCHW*(
stride����*!
input_names �:x�:w**
dilation����*
kernel_size��*
group2
 
 


�

60 

features.5.conv.3.gamma 

features.5.conv.3.beta 
!
features.5.conv.3.moving_mean 
%
!features.5.conv.3.moving_variance 61FusedBatchNorm"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d*l
output_names\ �:y�:running_mean�:running_variance�:	save_mean�:save_inv_variance*G
input_names8 �:x�	:scale�:b�:mean�:variance*
mode*
momentum-���=*
epsilon-��'72,(





�

61 
	
cst23 62tuple_getitem"\Default/network-TrainOneStepCell/network-WithLossCell/_loss_fn-SoftmaxCrossEntropyWithLogits2
 
 


�

51 

62 63	TensorAdd"vDefault/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/5-InvertedResidual*
output_names �
:output*!
input_names �:x�:y2
 
 


�

63 
'
#features.6.conv.0.features.0.weight 64Conv2D"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/5-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/0-Conv2d**
pad_list� � � � *
pad *
pad_mode:same*
mode*
out_channel�*
output_names �
:output*
data_format:NCHW*(
stride����*!
input_names �:x�:w**
dilation����*
kernel_size��*
group2
 
�


�

64 
&
"features.6.conv.0.features.1.gamma 
%
!features.6.conv.0.features.1.beta 
,
(features.6.conv.0.features.1.moving_mean 
0
,features.6.conv.0.features.1.moving_variance 65FusedBatchNorm"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/5-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d*l
output_names\ �:y�:running_mean�:running_variance�:	save_mean�:save_inv_variance*G
input_names8 �:x�	:scale�:b�:mean�:variance*
mode*
momentum-���=*
epsilon-��'72,(





�

65 
	
cst24 66tuple_getitem"\Default/network-TrainOneStepCell/network-WithLossCell/_loss_fn-SoftmaxCrossEntropyWithLogits2
 
�


�

66 67ReLU6"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/6-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/2-ReLU6*
output_names �
:output*
input_names
 �:x2
 
�


�

67 
'
#features.6.conv.1.features.0.weight 68DepthwiseConv2dNative"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/6-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/0-DepthWiseConv*&
pads����*
pad *
pad_mode:same*
channel_multiplier*
mode*
data_format:NCHW*(
stride����*!
input_names �:x�:w**
dilation����*
kernel_size*
group*
output_names �
:output2
 
�


�

68 
&
"features.6.conv.1.features.1.gamma 
%
!features.6.conv.1.features.1.beta 
,
(features.6.conv.1.features.1.moving_mean 
0
,features.6.conv.1.features.1.moving_variance 69FusedBatchNorm"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/5-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d*l
output_names\ �:y�:running_mean�:running_variance�:	save_mean�:save_inv_variance*G
input_names8 �:x�	:scale�:b�:mean�:variance*
mode*
momentum-���=*
epsilon-��'72,(





�

69 
	
cst25 70tuple_getitem"\Default/network-TrainOneStepCell/network-WithLossCell/_loss_fn-SoftmaxCrossEntropyWithLogits2
 
�


�

70 71ReLU6"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/6-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/2-ReLU6*
output_names �
:output*
input_names
 �:x2
 
�


�

71 

features.6.conv.2.weight 72Conv2D"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/5-InvertedResidual/conv-SequentialCell/2-Conv2d**
pad_list� � � � *
pad *
pad_mode:same*
mode*
out_channel *
output_names �
:output*
data_format:NCHW*(
stride����*!
input_names �:x�:w**
dilation����*
kernel_size��*
group2
 
 


�

72 

features.6.conv.3.gamma 

features.6.conv.3.beta 
!
features.6.conv.3.moving_mean 
%
!features.6.conv.3.moving_variance 73FusedBatchNorm"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d*l
output_names\ �:y�:running_mean�:running_variance�:	save_mean�:save_inv_variance*G
input_names8 �:x�	:scale�:b�:mean�:variance*
mode*
momentum-���=*
epsilon-��'72,(





�

73 
	
cst26 74tuple_getitem"\Default/network-TrainOneStepCell/network-WithLossCell/_loss_fn-SoftmaxCrossEntropyWithLogits2
 
 


�

63 

74 75	TensorAdd"vDefault/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/6-InvertedResidual*
output_names �
:output*!
input_names �:x�:y2
 
 


�

75 
'
#features.7.conv.0.features.0.weight 76Conv2D"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/5-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/0-Conv2d**
pad_list� � � � *
pad *
pad_mode:same*
mode*
out_channel�*
output_names �
:output*
data_format:NCHW*(
stride����*!
input_names �:x�:w**
dilation����*
kernel_size��*
group2
 
�


�

76 
&
"features.7.conv.0.features.1.gamma 
%
!features.7.conv.0.features.1.beta 
,
(features.7.conv.0.features.1.moving_mean 
0
,features.7.conv.0.features.1.moving_variance 77FusedBatchNorm"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/5-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d*l
output_names\ �:y�:running_mean�:running_variance�:	save_mean�:save_inv_variance*G
input_names8 �:x�	:scale�:b�:mean�:variance*
mode*
momentum-���=*
epsilon-��'72,(





�

77 
	
cst27 78tuple_getitem"\Default/network-TrainOneStepCell/network-WithLossCell/_loss_fn-SoftmaxCrossEntropyWithLogits2
 
�


�

78 79ReLU6"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/7-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/2-ReLU6*
output_names �
:output*
input_names
 �:x2
 
�


�

79 
'
#features.7.conv.1.features.0.weight 80DepthwiseConv2dNative"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/7-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/0-DepthWiseConv*&
pads� �� �*
pad *
pad_mode:same*
channel_multiplier*
mode*
data_format:NCHW*(
stride����*!
input_names �:x�:w**
dilation����*
kernel_size*
group*
output_names �
:output2
 
�


�

80 
&
"features.7.conv.1.features.1.gamma 
%
!features.7.conv.1.features.1.beta 
,
(features.7.conv.1.features.1.moving_mean 
0
,features.7.conv.1.features.1.moving_variance 81FusedBatchNorm"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/5-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d*l
output_names\ �:y�:running_mean�:running_variance�:	save_mean�:save_inv_variance*G
input_names8 �:x�	:scale�:b�:mean�:variance*
mode*
momentum-���=*
epsilon-��'72,(





�

81 
	
cst28 82tuple_getitem"\Default/network-TrainOneStepCell/network-WithLossCell/_loss_fn-SoftmaxCrossEntropyWithLogits2
 
�


�

82 83ReLU6"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/7-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/2-ReLU6*
output_names �
:output*
input_names
 �:x2
 
�


�

83 

features.7.conv.2.weight 84Conv2D"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/7-InvertedResidual/conv-SequentialCell/2-Conv2d**
pad_list� � � � *
pad *
pad_mode:same*
mode*
out_channel@*
output_names �
:output*
data_format:NCHW*(
stride����*!
input_names �:x�:w**
dilation����*
kernel_size��*
group2
 
@


�

84 

features.7.conv.3.gamma 

features.7.conv.3.beta 
!
features.7.conv.3.moving_mean 
%
!features.7.conv.3.moving_variance 85FusedBatchNorm"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/7-InvertedResidual/conv-SequentialCell/3-BatchNorm2d*l
output_names\ �:y�:running_mean�:running_variance�:	save_mean�:save_inv_variance*G
input_names8 �:x�	:scale�:b�:mean�:variance*
mode*
momentum-���=*
epsilon-��'72,(





�

85 
	
cst29 86tuple_getitem"\Default/network-TrainOneStepCell/network-WithLossCell/_loss_fn-SoftmaxCrossEntropyWithLogits2
 
@


�

86 
'
#features.8.conv.0.features.0.weight 87Conv2D"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/8-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/0-Conv2d**
pad_list� � � � *
pad *
pad_mode:same*
mode*
out_channel�*
output_names �
:output*
data_format:NCHW*(
stride����*!
input_names �:x�:w**
dilation����*
kernel_size��*
group2
 
�


�

87 
&
"features.8.conv.0.features.1.gamma 
%
!features.8.conv.0.features.1.beta 
,
(features.8.conv.0.features.1.moving_mean 
0
,features.8.conv.0.features.1.moving_variance 88FusedBatchNorm"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/8-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d*l
output_names\ �:y�:running_mean�:running_variance�:	save_mean�:save_inv_variance*G
input_names8 �:x�	:scale�:b�:mean�:variance*
mode*
momentum-���=*
epsilon-��'72,(





�

88 
	
cst30 89tuple_getitem"\Default/network-TrainOneStepCell/network-WithLossCell/_loss_fn-SoftmaxCrossEntropyWithLogits2
 
�


�

89 90ReLU6"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/8-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/2-ReLU6*
output_names �
:output*
input_names
 �:x2
 
�


�

90 
'
#features.8.conv.1.features.0.weight 91DepthwiseConv2dNative"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/8-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/0-DepthWiseConv*&
pads����*
pad *
pad_mode:same*
channel_multiplier*
mode*
data_format:NCHW*(
stride����*!
input_names �:x�:w**
dilation����*
kernel_size*
group*
output_names �
:output2
 
�


�

91 
&
"features.8.conv.1.features.1.gamma 
%
!features.8.conv.1.features.1.beta 
,
(features.8.conv.1.features.1.moving_mean 
0
,features.8.conv.1.features.1.moving_variance 92FusedBatchNorm"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/8-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d*l
output_names\ �:y�:running_mean�:running_variance�:	save_mean�:save_inv_variance*G
input_names8 �:x�	:scale�:b�:mean�:variance*
mode*
momentum-���=*
epsilon-��'72,(





�

92 
	
cst31 93tuple_getitem"\Default/network-TrainOneStepCell/network-WithLossCell/_loss_fn-SoftmaxCrossEntropyWithLogits2
 
�


�

93 94ReLU6"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/8-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/2-ReLU6*
output_names �
:output*
input_names
 �:x2
 
�


�

94 

features.8.conv.2.weight 95Conv2D"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/8-InvertedResidual/conv-SequentialCell/2-Conv2d**
pad_list� � � � *
pad *
pad_mode:same*
mode*
out_channel@*
output_names �
:output*
data_format:NCHW*(
stride����*!
input_names �:x�:w**
dilation����*
kernel_size��*
group2
 
@


�

95 

features.8.conv.3.gamma 

features.8.conv.3.beta 
!
features.8.conv.3.moving_mean 
%
!features.8.conv.3.moving_variance 96FusedBatchNorm"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/7-InvertedResidual/conv-SequentialCell/3-BatchNorm2d*l
output_names\ �:y�:running_mean�:running_variance�:	save_mean�:save_inv_variance*G
input_names8 �:x�	:scale�:b�:mean�:variance*
mode*
momentum-���=*
epsilon-��'72,(





�

96 
	
cst32 97tuple_getitem"\Default/network-TrainOneStepCell/network-WithLossCell/_loss_fn-SoftmaxCrossEntropyWithLogits2
 
@


�

86 

97 98	TensorAdd"vDefault/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/8-InvertedResidual*
output_names �
:output*!
input_names �:x�:y2
 
@


�

98 
'
#features.9.conv.0.features.0.weight 99Conv2D"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/8-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/0-Conv2d**
pad_list� � � � *
pad *
pad_mode:same*
mode*
out_channel�*
output_names �
:output*
data_format:NCHW*(
stride����*!
input_names �:x�:w**
dilation����*
kernel_size��*
group2
 
�


�

99 
&
"features.9.conv.0.features.1.gamma 
%
!features.9.conv.0.features.1.beta 
,
(features.9.conv.0.features.1.moving_mean 
0
,features.9.conv.0.features.1.moving_variance 100FusedBatchNorm"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/8-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d*l
output_names\ �:y�:running_mean�:running_variance�:	save_mean�:save_inv_variance*G
input_names8 �:x�	:scale�:b�:mean�:variance*
mode*
momentum-���=*
epsilon-��'72,(





�

100 
	
cst33 101tuple_getitem"\Default/network-TrainOneStepCell/network-WithLossCell/_loss_fn-SoftmaxCrossEntropyWithLogits2
 
�


�

101 102ReLU6"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/9-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/2-ReLU6*
output_names �
:output*
input_names
 �:x2
 
�


�

102 
'
#features.9.conv.1.features.0.weight 103DepthwiseConv2dNative"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/9-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/0-DepthWiseConv*&
pads����*
pad *
pad_mode:same*
channel_multiplier*
mode*
data_format:NCHW*(
stride����*!
input_names �:x�:w**
dilation����*
kernel_size*
group*
output_names �
:output2
 
�


�

103 
&
"features.9.conv.1.features.1.gamma 
%
!features.9.conv.1.features.1.beta 
,
(features.9.conv.1.features.1.moving_mean 
0
,features.9.conv.1.features.1.moving_variance 104FusedBatchNorm"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/8-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d*l
output_names\ �:y�:running_mean�:running_variance�:	save_mean�:save_inv_variance*G
input_names8 �:x�	:scale�:b�:mean�:variance*
mode*
momentum-���=*
epsilon-��'72,(





�

104 
	
cst34 105tuple_getitem"\Default/network-TrainOneStepCell/network-WithLossCell/_loss_fn-SoftmaxCrossEntropyWithLogits2
 
�


�

105 106ReLU6"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/9-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/2-ReLU6*
output_names �
:output*
input_names
 �:x2
 
�


�

106 

features.9.conv.2.weight 107Conv2D"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/8-InvertedResidual/conv-SequentialCell/2-Conv2d**
pad_list� � � � *
pad *
pad_mode:same*
mode*
out_channel@*
output_names �
:output*
data_format:NCHW*(
stride����*!
input_names �:x�:w**
dilation����*
kernel_size��*
group2
 
@


�

107 

features.9.conv.3.gamma 

features.9.conv.3.beta 
!
features.9.conv.3.moving_mean 
%
!features.9.conv.3.moving_variance 108FusedBatchNorm"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/7-InvertedResidual/conv-SequentialCell/3-BatchNorm2d*l
output_names\ �:y�:running_mean�:running_variance�:	save_mean�:save_inv_variance*G
input_names8 �:x�	:scale�:b�:mean�:variance*
mode*
momentum-���=*
epsilon-��'72,(





�

108 
	
cst35 109tuple_getitem"\Default/network-TrainOneStepCell/network-WithLossCell/_loss_fn-SoftmaxCrossEntropyWithLogits2
 
@


�

98 

109 110	TensorAdd"vDefault/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/9-InvertedResidual*
output_names �
:output*!
input_names �:x�:y2
 
@


�

110 
(
$features.10.conv.0.features.0.weight 111Conv2D"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/8-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/0-Conv2d**
pad_list� � � � *
pad *
pad_mode:same*
mode*
out_channel�*
output_names �
:output*
data_format:NCHW*(
stride����*!
input_names �:x�:w**
dilation����*
kernel_size��*
group2
 
�


�

111 
'
#features.10.conv.0.features.1.gamma 
&
"features.10.conv.0.features.1.beta 
-
)features.10.conv.0.features.1.moving_mean 
1
-features.10.conv.0.features.1.moving_variance 112FusedBatchNorm"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/8-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d*l
output_names\ �:y�:running_mean�:running_variance�:	save_mean�:save_inv_variance*G
input_names8 �:x�	:scale�:b�:mean�:variance*
mode*
momentum-���=*
epsilon-��'72,(





�

112 
	
cst36 113tuple_getitem"\Default/network-TrainOneStepCell/network-WithLossCell/_loss_fn-SoftmaxCrossEntropyWithLogits2
 
�


�

113 114ReLU6"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/10-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/2-ReLU6*
output_names �
:output*
input_names
 �:x2
 
�


�

114 
(
$features.10.conv.1.features.0.weight 115DepthwiseConv2dNative"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/10-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/0-DepthWiseConv*&
pads����*
pad *
pad_mode:same*
channel_multiplier*
mode*
data_format:NCHW*(
stride����*!
input_names �:x�:w**
dilation����*
kernel_size*
group*
output_names �
:output2
 
�


�

115 
'
#features.10.conv.1.features.1.gamma 
&
"features.10.conv.1.features.1.beta 
-
)features.10.conv.1.features.1.moving_mean 
1
-features.10.conv.1.features.1.moving_variance 116FusedBatchNorm"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/8-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d*l
output_names\ �:y�:running_mean�:running_variance�:	save_mean�:save_inv_variance*G
input_names8 �:x�	:scale�:b�:mean�:variance*
mode*
momentum-���=*
epsilon-��'72,(





�

116 
	
cst37 117tuple_getitem"\Default/network-TrainOneStepCell/network-WithLossCell/_loss_fn-SoftmaxCrossEntropyWithLogits2
 
�


�

117 118ReLU6"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/10-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/2-ReLU6*
output_names �
:output*
input_names
 �:x2
 
�


�

118 

features.10.conv.2.weight 119Conv2D"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/8-InvertedResidual/conv-SequentialCell/2-Conv2d**
pad_list� � � � *
pad *
pad_mode:same*
mode*
out_channel@*
output_names �
:output*
data_format:NCHW*(
stride����*!
input_names �:x�:w**
dilation����*
kernel_size��*
group2
 
@


�

119 

features.10.conv.3.gamma 

features.10.conv.3.beta 
"
features.10.conv.3.moving_mean 
&
"features.10.conv.3.moving_variance 120FusedBatchNorm"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/7-InvertedResidual/conv-SequentialCell/3-BatchNorm2d*l
output_names\ �:y�:running_mean�:running_variance�:	save_mean�:save_inv_variance*G
input_names8 �:x�	:scale�:b�:mean�:variance*
mode*
momentum-���=*
epsilon-��'72,(





�

120 
	
cst38 121tuple_getitem"\Default/network-TrainOneStepCell/network-WithLossCell/_loss_fn-SoftmaxCrossEntropyWithLogits2
 
@


�

110 

121 122	TensorAdd"wDefault/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/10-InvertedResidual*
output_names �
:output*!
input_names �:x�:y2
 
@


�

122 
(
$features.11.conv.0.features.0.weight 123Conv2D"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/8-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/0-Conv2d**
pad_list� � � � *
pad *
pad_mode:same*
mode*
out_channel�*
output_names �
:output*
data_format:NCHW*(
stride����*!
input_names �:x�:w**
dilation����*
kernel_size��*
group2
 
�


�

123 
'
#features.11.conv.0.features.1.gamma 
&
"features.11.conv.0.features.1.beta 
-
)features.11.conv.0.features.1.moving_mean 
1
-features.11.conv.0.features.1.moving_variance 124FusedBatchNorm"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/8-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d*l
output_names\ �:y�:running_mean�:running_variance�:	save_mean�:save_inv_variance*G
input_names8 �:x�	:scale�:b�:mean�:variance*
mode*
momentum-���=*
epsilon-��'72,(





�

124 
	
cst39 125tuple_getitem"\Default/network-TrainOneStepCell/network-WithLossCell/_loss_fn-SoftmaxCrossEntropyWithLogits2
 
�


�

125 126ReLU6"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/11-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/2-ReLU6*
output_names �
:output*
input_names
 �:x2
 
�


�

126 
(
$features.11.conv.1.features.0.weight 127DepthwiseConv2dNative"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/11-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/0-DepthWiseConv*&
pads����*
pad *
pad_mode:same*
channel_multiplier*
mode*
data_format:NCHW*(
stride����*!
input_names �:x�:w**
dilation����*
kernel_size*
group*
output_names �
:output2
 
�


�

127 
'
#features.11.conv.1.features.1.gamma 
&
"features.11.conv.1.features.1.beta 
-
)features.11.conv.1.features.1.moving_mean 
1
-features.11.conv.1.features.1.moving_variance 128FusedBatchNorm"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/8-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d*l
output_names\ �:y�:running_mean�:running_variance�:	save_mean�:save_inv_variance*G
input_names8 �:x�	:scale�:b�:mean�:variance*
mode*
momentum-���=*
epsilon-��'72,(





�

128 
	
cst40 129tuple_getitem"\Default/network-TrainOneStepCell/network-WithLossCell/_loss_fn-SoftmaxCrossEntropyWithLogits2
 
�


�

129 130ReLU6"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/11-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/2-ReLU6*
output_names �
:output*
input_names
 �:x2
 
�


�

130 

features.11.conv.2.weight 131Conv2D"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/11-InvertedResidual/conv-SequentialCell/2-Conv2d**
pad_list� � � � *
pad *
pad_mode:same*
mode*
out_channel`*
output_names �
:output*
data_format:NCHW*(
stride����*!
input_names �:x�:w**
dilation����*
kernel_size��*
group2
 
`


�

131 

features.11.conv.3.gamma 

features.11.conv.3.beta 
"
features.11.conv.3.moving_mean 
&
"features.11.conv.3.moving_variance 132FusedBatchNorm"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/11-InvertedResidual/conv-SequentialCell/3-BatchNorm2d*l
output_names\ �:y�:running_mean�:running_variance�:	save_mean�:save_inv_variance*G
input_names8 �:x�	:scale�:b�:mean�:variance*
mode*
momentum-���=*
epsilon-��'72,(





�

132 
	
cst41 133tuple_getitem"\Default/network-TrainOneStepCell/network-WithLossCell/_loss_fn-SoftmaxCrossEntropyWithLogits2
 
`


�

133 
(
$features.12.conv.0.features.0.weight 134Conv2D"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/12-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/0-Conv2d**
pad_list� � � � *
pad *
pad_mode:same*
mode*
out_channel�*
output_names �
:output*
data_format:NCHW*(
stride����*!
input_names �:x�:w**
dilation����*
kernel_size��*
group2
 
�


�

134 
'
#features.12.conv.0.features.1.gamma 
&
"features.12.conv.0.features.1.beta 
-
)features.12.conv.0.features.1.moving_mean 
1
-features.12.conv.0.features.1.moving_variance 135FusedBatchNorm"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/12-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d*l
output_names\ �:y�:running_mean�:running_variance�:	save_mean�:save_inv_variance*G
input_names8 �:x�	:scale�:b�:mean�:variance*
mode*
momentum-���=*
epsilon-��'72,(





�

135 
	
cst42 136tuple_getitem"\Default/network-TrainOneStepCell/network-WithLossCell/_loss_fn-SoftmaxCrossEntropyWithLogits2
 
�


�

136 137ReLU6"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/12-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/2-ReLU6*
output_names �
:output*
input_names
 �:x2
 
�


�

137 
(
$features.12.conv.1.features.0.weight 138DepthwiseConv2dNative"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/12-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/0-DepthWiseConv*&
pads����*
pad *
pad_mode:same*
channel_multiplier*
mode*
data_format:NCHW*(
stride����*!
input_names �:x�:w**
dilation����*
kernel_size*
group*
output_names �
:output2
 
�


�

138 
'
#features.12.conv.1.features.1.gamma 
&
"features.12.conv.1.features.1.beta 
-
)features.12.conv.1.features.1.moving_mean 
1
-features.12.conv.1.features.1.moving_variance 139FusedBatchNorm"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/12-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d*l
output_names\ �:y�:running_mean�:running_variance�:	save_mean�:save_inv_variance*G
input_names8 �:x�	:scale�:b�:mean�:variance*
mode*
momentum-���=*
epsilon-��'72,(





�

139 
	
cst43 140tuple_getitem"\Default/network-TrainOneStepCell/network-WithLossCell/_loss_fn-SoftmaxCrossEntropyWithLogits2
 
�


�

140 141ReLU6"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/12-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/2-ReLU6*
output_names �
:output*
input_names
 �:x2
 
�


�

141 

features.12.conv.2.weight 142Conv2D"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/12-InvertedResidual/conv-SequentialCell/2-Conv2d**
pad_list� � � � *
pad *
pad_mode:same*
mode*
out_channel`*
output_names �
:output*
data_format:NCHW*(
stride����*!
input_names �:x�:w**
dilation����*
kernel_size��*
group2
 
`


�

142 

features.12.conv.3.gamma 

features.12.conv.3.beta 
"
features.12.conv.3.moving_mean 
&
"features.12.conv.3.moving_variance 143FusedBatchNorm"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/11-InvertedResidual/conv-SequentialCell/3-BatchNorm2d*l
output_names\ �:y�:running_mean�:running_variance�:	save_mean�:save_inv_variance*G
input_names8 �:x�	:scale�:b�:mean�:variance*
mode*
momentum-���=*
epsilon-��'72,(





�

143 
	
cst44 144tuple_getitem"\Default/network-TrainOneStepCell/network-WithLossCell/_loss_fn-SoftmaxCrossEntropyWithLogits2
 
`


�

133 

144 145	TensorAdd"wDefault/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/12-InvertedResidual*
output_names �
:output*!
input_names �:x�:y2
 
`


�

145 
(
$features.13.conv.0.features.0.weight 146Conv2D"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/12-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/0-Conv2d**
pad_list� � � � *
pad *
pad_mode:same*
mode*
out_channel�*
output_names �
:output*
data_format:NCHW*(
stride����*!
input_names �:x�:w**
dilation����*
kernel_size��*
group2
 
�


�

146 
'
#features.13.conv.0.features.1.gamma 
&
"features.13.conv.0.features.1.beta 
-
)features.13.conv.0.features.1.moving_mean 
1
-features.13.conv.0.features.1.moving_variance 147FusedBatchNorm"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/12-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d*l
output_names\ �:y�:running_mean�:running_variance�:	save_mean�:save_inv_variance*G
input_names8 �:x�	:scale�:b�:mean�:variance*
mode*
momentum-���=*
epsilon-��'72,(





�

147 
	
cst45 148tuple_getitem"\Default/network-TrainOneStepCell/network-WithLossCell/_loss_fn-SoftmaxCrossEntropyWithLogits2
 
�


�

148 149ReLU6"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/13-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/2-ReLU6*
output_names �
:output*
input_names
 �:x2
 
�


�

149 
(
$features.13.conv.1.features.0.weight 150DepthwiseConv2dNative"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/13-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/0-DepthWiseConv*&
pads����*
pad *
pad_mode:same*
channel_multiplier*
mode*
data_format:NCHW*(
stride����*!
input_names �:x�:w**
dilation����*
kernel_size*
group*
output_names �
:output2
 
�


�

150 
'
#features.13.conv.1.features.1.gamma 
&
"features.13.conv.1.features.1.beta 
-
)features.13.conv.1.features.1.moving_mean 
1
-features.13.conv.1.features.1.moving_variance 151FusedBatchNorm"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/12-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d*l
output_names\ �:y�:running_mean�:running_variance�:	save_mean�:save_inv_variance*G
input_names8 �:x�	:scale�:b�:mean�:variance*
mode*
momentum-���=*
epsilon-��'72,(





�

151 
	
cst46 152tuple_getitem"\Default/network-TrainOneStepCell/network-WithLossCell/_loss_fn-SoftmaxCrossEntropyWithLogits2
 
�


�

152 153ReLU6"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/13-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/2-ReLU6*
output_names �
:output*
input_names
 �:x2
 
�


�

153 

features.13.conv.2.weight 154Conv2D"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/12-InvertedResidual/conv-SequentialCell/2-Conv2d**
pad_list� � � � *
pad *
pad_mode:same*
mode*
out_channel`*
output_names �
:output*
data_format:NCHW*(
stride����*!
input_names �:x�:w**
dilation����*
kernel_size��*
group2
 
`


�

154 

features.13.conv.3.gamma 

features.13.conv.3.beta 
"
features.13.conv.3.moving_mean 
&
"features.13.conv.3.moving_variance 155FusedBatchNorm"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/11-InvertedResidual/conv-SequentialCell/3-BatchNorm2d*l
output_names\ �:y�:running_mean�:running_variance�:	save_mean�:save_inv_variance*G
input_names8 �:x�	:scale�:b�:mean�:variance*
mode*
momentum-���=*
epsilon-��'72,(





�

155 
	
cst47 156tuple_getitem"\Default/network-TrainOneStepCell/network-WithLossCell/_loss_fn-SoftmaxCrossEntropyWithLogits2
 
`


�

145 

156 157	TensorAdd"wDefault/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/13-InvertedResidual*
output_names �
:output*!
input_names �:x�:y2
 
`


�

157 
(
$features.14.conv.0.features.0.weight 158Conv2D"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/12-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/0-Conv2d**
pad_list� � � � *
pad *
pad_mode:same*
mode*
out_channel�*
output_names �
:output*
data_format:NCHW*(
stride����*!
input_names �:x�:w**
dilation����*
kernel_size��*
group2
 
�


�

158 
'
#features.14.conv.0.features.1.gamma 
&
"features.14.conv.0.features.1.beta 
-
)features.14.conv.0.features.1.moving_mean 
1
-features.14.conv.0.features.1.moving_variance 159FusedBatchNorm"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/12-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d*l
output_names\ �:y�:running_mean�:running_variance�:	save_mean�:save_inv_variance*G
input_names8 �:x�	:scale�:b�:mean�:variance*
mode*
momentum-���=*
epsilon-��'72,(





�

159 
	
cst48 160tuple_getitem"\Default/network-TrainOneStepCell/network-WithLossCell/_loss_fn-SoftmaxCrossEntropyWithLogits2
 
�


�

160 161ReLU6"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/14-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/2-ReLU6*
output_names �
:output*
input_names
 �:x2
 
�


�

161 
(
$features.14.conv.1.features.0.weight 162DepthwiseConv2dNative"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/14-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/0-DepthWiseConv*&
pads� �� �*
pad *
pad_mode:same*
channel_multiplier*
mode*
data_format:NCHW*(
stride����*!
input_names �:x�:w**
dilation����*
kernel_size*
group*
output_names �
:output2
 
�


�

162 
'
#features.14.conv.1.features.1.gamma 
&
"features.14.conv.1.features.1.beta 
-
)features.14.conv.1.features.1.moving_mean 
1
-features.14.conv.1.features.1.moving_variance 163FusedBatchNorm"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/12-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d*l
output_names\ �:y�:running_mean�:running_variance�:	save_mean�:save_inv_variance*G
input_names8 �:x�	:scale�:b�:mean�:variance*
mode*
momentum-���=*
epsilon-��'72,(





�

163 
	
cst49 164tuple_getitem"\Default/network-TrainOneStepCell/network-WithLossCell/_loss_fn-SoftmaxCrossEntropyWithLogits2
 
�


�

164 165ReLU6"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/14-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/2-ReLU6*
output_names �
:output*
input_names
 �:x2
 
�


�

165 

features.14.conv.2.weight 166Conv2D"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/14-InvertedResidual/conv-SequentialCell/2-Conv2d**
pad_list� � � � *
pad *
pad_mode:same*
mode*
out_channel�*
output_names �
:output*
data_format:NCHW*(
stride����*!
input_names �:x�:w**
dilation����*
kernel_size��*
group2
 
�


�

166 

features.14.conv.3.gamma 

features.14.conv.3.beta 
"
features.14.conv.3.moving_mean 
&
"features.14.conv.3.moving_variance 167FusedBatchNorm"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/14-InvertedResidual/conv-SequentialCell/3-BatchNorm2d*l
output_names\ �:y�:running_mean�:running_variance�:	save_mean�:save_inv_variance*G
input_names8 �:x�	:scale�:b�:mean�:variance*
mode*
momentum-���=*
epsilon-��'72,(





�

167 
	
cst50 168tuple_getitem"\Default/network-TrainOneStepCell/network-WithLossCell/_loss_fn-SoftmaxCrossEntropyWithLogits2
 
�


�

168 
(
$features.15.conv.0.features.0.weight 169Conv2D"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/15-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/0-Conv2d**
pad_list� � � � *
pad *
pad_mode:same*
mode*
out_channel�*
output_names �
:output*
data_format:NCHW*(
stride����*!
input_names �:x�:w**
dilation����*
kernel_size��*
group2
 
�


�

169 
'
#features.15.conv.0.features.1.gamma 
&
"features.15.conv.0.features.1.beta 
-
)features.15.conv.0.features.1.moving_mean 
1
-features.15.conv.0.features.1.moving_variance 170FusedBatchNorm"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/15-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d*l
output_names\ �:y�:running_mean�:running_variance�:	save_mean�:save_inv_variance*G
input_names8 �:x�	:scale�:b�:mean�:variance*
mode*
momentum-���=*
epsilon-��'72,(





�

170 
	
cst51 171tuple_getitem"\Default/network-TrainOneStepCell/network-WithLossCell/_loss_fn-SoftmaxCrossEntropyWithLogits2
 
�


�

171 172ReLU6"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/15-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/2-ReLU6*
output_names �
:output*
input_names
 �:x2
 
�


�

172 
(
$features.15.conv.1.features.0.weight 173DepthwiseConv2dNative"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/15-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/0-DepthWiseConv*&
pads����*
pad *
pad_mode:same*
channel_multiplier*
mode*
data_format:NCHW*(
stride����*!
input_names �:x�:w**
dilation����*
kernel_size*
group*
output_names �
:output2
 
�


�

173 
'
#features.15.conv.1.features.1.gamma 
&
"features.15.conv.1.features.1.beta 
-
)features.15.conv.1.features.1.moving_mean 
1
-features.15.conv.1.features.1.moving_variance 174FusedBatchNorm"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/15-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d*l
output_names\ �:y�:running_mean�:running_variance�:	save_mean�:save_inv_variance*G
input_names8 �:x�	:scale�:b�:mean�:variance*
mode*
momentum-���=*
epsilon-��'72,(





�

174 
	
cst52 175tuple_getitem"\Default/network-TrainOneStepCell/network-WithLossCell/_loss_fn-SoftmaxCrossEntropyWithLogits2
 
�


�

175 176ReLU6"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/15-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/2-ReLU6*
output_names �
:output*
input_names
 �:x2
 
�


�

176 

features.15.conv.2.weight 177Conv2D"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/15-InvertedResidual/conv-SequentialCell/2-Conv2d**
pad_list� � � � *
pad *
pad_mode:same*
mode*
out_channel�*
output_names �
:output*
data_format:NCHW*(
stride����*!
input_names �:x�:w**
dilation����*
kernel_size��*
group2
 
�


�

177 

features.15.conv.3.gamma 

features.15.conv.3.beta 
"
features.15.conv.3.moving_mean 
&
"features.15.conv.3.moving_variance 178FusedBatchNorm"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/14-InvertedResidual/conv-SequentialCell/3-BatchNorm2d*l
output_names\ �:y�:running_mean�:running_variance�:	save_mean�:save_inv_variance*G
input_names8 �:x�	:scale�:b�:mean�:variance*
mode*
momentum-���=*
epsilon-��'72,(





�

178 
	
cst53 179tuple_getitem"\Default/network-TrainOneStepCell/network-WithLossCell/_loss_fn-SoftmaxCrossEntropyWithLogits2
 
�


�

168 

179 180	TensorAdd"wDefault/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/15-InvertedResidual*
output_names �
:output*!
input_names �:x�:y2
 
�


�

180 
(
$features.16.conv.0.features.0.weight 181Conv2D"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/15-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/0-Conv2d**
pad_list� � � � *
pad *
pad_mode:same*
mode*
out_channel�*
output_names �
:output*
data_format:NCHW*(
stride����*!
input_names �:x�:w**
dilation����*
kernel_size��*
group2
 
�


�

181 
'
#features.16.conv.0.features.1.gamma 
&
"features.16.conv.0.features.1.beta 
-
)features.16.conv.0.features.1.moving_mean 
1
-features.16.conv.0.features.1.moving_variance 182FusedBatchNorm"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/15-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d*l
output_names\ �:y�:running_mean�:running_variance�:	save_mean�:save_inv_variance*G
input_names8 �:x�	:scale�:b�:mean�:variance*
mode*
momentum-���=*
epsilon-��'72,(





�

182 
	
cst54 183tuple_getitem"\Default/network-TrainOneStepCell/network-WithLossCell/_loss_fn-SoftmaxCrossEntropyWithLogits2
 
�


�

183 184ReLU6"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/16-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/2-ReLU6*
output_names �
:output*
input_names
 �:x2
 
�


�

184 
(
$features.16.conv.1.features.0.weight 185DepthwiseConv2dNative"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/16-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/0-DepthWiseConv*&
pads����*
pad *
pad_mode:same*
channel_multiplier*
mode*
data_format:NCHW*(
stride����*!
input_names �:x�:w**
dilation����*
kernel_size*
group*
output_names �
:output2
 
�


�

185 
'
#features.16.conv.1.features.1.gamma 
&
"features.16.conv.1.features.1.beta 
-
)features.16.conv.1.features.1.moving_mean 
1
-features.16.conv.1.features.1.moving_variance 186FusedBatchNorm"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/15-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d*l
output_names\ �:y�:running_mean�:running_variance�:	save_mean�:save_inv_variance*G
input_names8 �:x�	:scale�:b�:mean�:variance*
mode*
momentum-���=*
epsilon-��'72,(





�

186 
	
cst55 187tuple_getitem"\Default/network-TrainOneStepCell/network-WithLossCell/_loss_fn-SoftmaxCrossEntropyWithLogits2
 
�


�

187 188ReLU6"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/16-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/2-ReLU6*
output_names �
:output*
input_names
 �:x2
 
�


�

188 

features.16.conv.2.weight 189Conv2D"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/15-InvertedResidual/conv-SequentialCell/2-Conv2d**
pad_list� � � � *
pad *
pad_mode:same*
mode*
out_channel�*
output_names �
:output*
data_format:NCHW*(
stride����*!
input_names �:x�:w**
dilation����*
kernel_size��*
group2
 
�


�

189 

features.16.conv.3.gamma 

features.16.conv.3.beta 
"
features.16.conv.3.moving_mean 
&
"features.16.conv.3.moving_variance 190FusedBatchNorm"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/14-InvertedResidual/conv-SequentialCell/3-BatchNorm2d*l
output_names\ �:y�:running_mean�:running_variance�:	save_mean�:save_inv_variance*G
input_names8 �:x�	:scale�:b�:mean�:variance*
mode*
momentum-���=*
epsilon-��'72,(





�

190 
	
cst56 191tuple_getitem"\Default/network-TrainOneStepCell/network-WithLossCell/_loss_fn-SoftmaxCrossEntropyWithLogits2
 
�


�

180 

191 192	TensorAdd"wDefault/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/16-InvertedResidual*
output_names �
:output*!
input_names �:x�:y2
 
�


�

192 
(
$features.17.conv.0.features.0.weight 193Conv2D"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/15-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/0-Conv2d**
pad_list� � � � *
pad *
pad_mode:same*
mode*
out_channel�*
output_names �
:output*
data_format:NCHW*(
stride����*!
input_names �:x�:w**
dilation����*
kernel_size��*
group2
 
�


�

193 
'
#features.17.conv.0.features.1.gamma 
&
"features.17.conv.0.features.1.beta 
-
)features.17.conv.0.features.1.moving_mean 
1
-features.17.conv.0.features.1.moving_variance 194FusedBatchNorm"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/15-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d*l
output_names\ �:y�:running_mean�:running_variance�:	save_mean�:save_inv_variance*G
input_names8 �:x�	:scale�:b�:mean�:variance*
mode*
momentum-���=*
epsilon-��'72,(





�

194 
	
cst57 195tuple_getitem"\Default/network-TrainOneStepCell/network-WithLossCell/_loss_fn-SoftmaxCrossEntropyWithLogits2
 
�


�

195 196ReLU6"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/17-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/2-ReLU6*
output_names �
:output*
input_names
 �:x2
 
�


�

196 
(
$features.17.conv.1.features.0.weight 197DepthwiseConv2dNative"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/17-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/0-DepthWiseConv*&
pads����*
pad *
pad_mode:same*
channel_multiplier*
mode*
data_format:NCHW*(
stride����*!
input_names �:x�:w**
dilation����*
kernel_size*
group*
output_names �
:output2
 
�


�

197 
'
#features.17.conv.1.features.1.gamma 
&
"features.17.conv.1.features.1.beta 
-
)features.17.conv.1.features.1.moving_mean 
1
-features.17.conv.1.features.1.moving_variance 198FusedBatchNorm"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/15-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d*l
output_names\ �:y�:running_mean�:running_variance�:	save_mean�:save_inv_variance*G
input_names8 �:x�	:scale�:b�:mean�:variance*
mode*
momentum-���=*
epsilon-��'72,(





�

198 
	
cst58 199tuple_getitem"\Default/network-TrainOneStepCell/network-WithLossCell/_loss_fn-SoftmaxCrossEntropyWithLogits2
 
�


�

199 200ReLU6"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/17-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/2-ReLU6*
output_names �
:output*
input_names
 �:x2
 
�


�

200 

features.17.conv.2.weight 201Conv2D"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/17-InvertedResidual/conv-SequentialCell/2-Conv2d**
pad_list� � � � *
pad *
pad_mode:same*
mode*
out_channel�*
output_names �
:output*
data_format:NCHW*(
stride����*!
input_names �:x�:w**
dilation����*
kernel_size��*
group2
 
�


�

201 

features.17.conv.3.gamma 

features.17.conv.3.beta 
"
features.17.conv.3.moving_mean 
&
"features.17.conv.3.moving_variance 202FusedBatchNorm"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/17-InvertedResidual/conv-SequentialCell/3-BatchNorm2d*l
output_names\ �:y�:running_mean�:running_variance�:	save_mean�:save_inv_variance*G
input_names8 �:x�	:scale�:b�:mean�:variance*
mode*
momentum-���=*
epsilon-��'72,(





�

202 
	
cst59 203tuple_getitem"\Default/network-TrainOneStepCell/network-WithLossCell/_loss_fn-SoftmaxCrossEntropyWithLogits2
 
�


�

203 
!
features.18.features.0.weight 204Conv2D"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/0-Conv2d**
pad_list� � � � *
pad *
pad_mode:same*
mode*
out_channel�
*
output_names �
:output*
data_format:NCHW*(
stride����*!
input_names �:x�:w**
dilation����*
kernel_size��*
group2
 
�



�

204 
 
features.18.features.1.gamma 

features.18.features.1.beta 
&
"features.18.features.1.moving_mean 
*
&features.18.features.1.moving_variance 205FusedBatchNorm"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d*l
output_names\ �:y�:running_mean�:running_variance�:	save_mean�:save_inv_variance*G
input_names8 �:x�	:scale�:b�:mean�:variance*
mode*
momentum-���=*
epsilon-��'72,(





�

205 
	
cst60 206tuple_getitem"\Default/network-TrainOneStepCell/network-WithLossCell/_loss_fn-SoftmaxCrossEntropyWithLogits2
 
�



�

206 207ReLU6"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/2-ReLU6*
output_names �
:output*
input_names
 �:x2
 
�



�

207 
	
cst61 208
ReduceMean"rDefault/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/head-SequentialCell/0-GlobalAvgPooling*
	keep_dims*
output_names
 �:y**
input_names �:input_x�:axis2
 
�



�

208 
	
cst62 209Reshape"rDefault/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/head-SequentialCell/0-GlobalAvgPooling*
output_names �
:output**
input_names �
:tensor�	:shape2	
 
�

�

209 

head.1.weight 210MatMul"gDefault/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/head-SequentialCell/1-Dense*
transpose_b*
transpose_a *
transpose_x2*
transpose_x1 *#
input_names �:x1�:x2*
output_names �
:output2	
 
�
�

210 

head.1.bias 211BiasAdd"gDefault/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/head-SequentialCell/1-Dense*
data_format:NCHW*!
input_names �:x�:b*
output_names �
:output2	
 
�
�

211 

5 212SoftmaxCrossEntropyWithLogits"\Default/network-TrainOneStepCell/network-WithLossCell/_loss_fn-SoftmaxCrossEntropyWithLogits2


�

212 
	
cst63 213tuple_getitem"\Default/network-TrainOneStepCell/network-WithLossCell/_loss_fn-SoftmaxCrossEntropyWithLogits2	
 
�
�

213 

2 214Mul"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_loss_fn-SoftmaxCrossEntropyWithLogits/gradSoftmaxCrossEntropyWithLogits*
output_names �
:output*!
input_names �:x�:y2	
 
�
�

214 215BiasAddGrad"}Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/head-SequentialCell/1-Dense/gradBiasAdd*
data_format:NCHW*
input_names �:dout*
output_names �
:output2	
�
l

215 

1 216
make_tuple"3Default/network-TrainOneStepCell/optimizer-Momentum2


�

216 217AddN"3Default/network-TrainOneStepCell/optimizer-Momentum*	
n*
input_names �
:inputs*
output_names �:sum2	
�
�

217 
	
cst64 218Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�

global_step 
	
cst65 219	AssignAdd"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*'
input_names �:ref�	:value2
�

learning_rate 

global_step 
	
cst66 220GatherV2"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*7
input_names( �
:params�:indices�:axis2

t

220 

219 221ControlDepend"3Default/network-TrainOneStepCell/optimizer-Momentum*
depend_mode 2
b

220 

221 222depend"3Default/network-TrainOneStepCell/optimizer-Momentum2

�

head.1.bias 

moments.head.1.bias 

222 

218 

momentum 223ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
Z
	
cst67 

223 224depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

head.1.weight 
	
cst68 225Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2

�
�

�

214 

209 226MatMul"|Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/head-SequentialCell/1-Dense/gradMatMul*
transpose_b *
transpose_a*
transpose_x2 *
transpose_x1*#
input_names �:x1�:x2*
output_names �
:output2

�
�

n

226 

225 227
make_tuple"3Default/network-TrainOneStepCell/optimizer-Momentum2


�

227 228AddN"3Default/network-TrainOneStepCell/optimizer-Momentum*	
n*
input_names �
:inputs*
output_names �:sum2

�
�

�

228 
	
cst69 229Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2

�
�

�

head.1.weight 

moments.head.1.weight 

222 

229 

momentum 230ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2

�
�

Z
	
cst67 

230 231depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

205 
	
cst70 232tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�

�

205 
	
cst71 233tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�

�

214 

head.1.weight 234MatMul"|Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/head-SequentialCell/1-Dense/gradMatMul*
transpose_b *
transpose_a *
transpose_x2 *
transpose_x1 *#
input_names �:x1�:x2*
output_names �
:output2	
 
�

�

234 
	
cst72 235Reshape"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/head-SequentialCell/0-GlobalAvgPooling/gradReshape*
output_names �
:output**
input_names �
:tensor�	:shape2
 
�



�

235 
	
cst73 236Tile"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/head-SequentialCell/0-GlobalAvgPooling/gradReduceMean*
output_names �
:output*)
input_names �:x�:	multiples2
 
�



�

236 
	
cst74 237RealDiv"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/head-SequentialCell/0-GlobalAvgPooling/gradReduceMean*
output_names �
:output*!
input_names �:x�:y2
 
�



�

237 

206 238	ReLU6Grad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/2-ReLU6/gradReLU6*
output_names �
:output*&
input_names �
:y_grad�:x2
 
�



�

238 

204 
 
features.18.features.1.gamma 

233 

232 239FusedBatchNormGrad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm*8
output_names( �:dx�:bn_scale�:bn_bias*V
input_namesG �:dy�:x�	:scale�:	save_mean�:save_inv_variance*
epsilon-��'7*
momentum-���=2



�

239 
	
cst75 240tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�

�

240 
	
cst76 241Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�

�

features.18.features.1.beta 
'
#moments.features.18.features.1.beta 

222 

241 

momentum 242ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�

Z
	
cst67 

242 243depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

239 
	
cst77 244tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�

�

244 
	
cst78 245Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�

�
 
features.18.features.1.gamma 
(
$moments.features.18.features.1.gamma 

222 

245 

momentum 246ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�

Z
	
cst67 

246 247depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�
!
features.18.features.0.weight 
	
cst79 248Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
�

�


�

239 
	
cst80 249tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
 
�



�

249 

203 
	
cst81 250Conv2DBackpropFilter"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/0-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel�
*
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�	:input�:filter_sizes**
dilation����*
kernel_size��*
group2
�

�


n

250 

248 251
make_tuple"3Default/network-TrainOneStepCell/optimizer-Momentum2


�

251 252AddN"3Default/network-TrainOneStepCell/optimizer-Momentum*	
n*
input_names �
:inputs*
output_names �:sum2
�

�


�

252 
	
cst82 253Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
�

�


�
!
features.18.features.0.weight 
)
%moments.features.18.features.0.weight 

222 

253 

momentum 254ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2
�

�


Z
	
cst67 

254 255depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

202 
	
cst83 256tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�

202 
	
cst84 257tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�

249 
!
features.18.features.0.weight 
	
cst85 258Conv2DBackpropInput"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/0-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel�
*
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�
:filter�:input_sizes**
dilation����*
kernel_size��*
group2
 
�


�

258 

201 

features.17.conv.3.gamma 

257 

256 259FusedBatchNormGrad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/17-InvertedResidual/conv-SequentialCell/3-BatchNorm2d/gradFusedBatchNorm*8
output_names( �:dx�:bn_scale�:bn_bias*V
input_namesG �:dy�:x�	:scale�:	save_mean�:save_inv_variance*
epsilon-��'7*
momentum-���=2



�

259 
	
cst86 260tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

260 
	
cst87 261Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�

features.17.conv.3.beta 
#
moments.features.17.conv.3.beta 

222 

261 

momentum 262ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
Z
	
cst67 

262 263depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

259 
	
cst88 264tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

264 
	
cst89 265Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�

features.17.conv.3.gamma 
$
 moments.features.17.conv.3.gamma 

222 

265 

momentum 266ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
Z
	
cst67 

266 267depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

features.17.conv.2.weight 
	
cst90 268Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
�
�


�

259 
	
cst91 269tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
 
�


�

269 

200 
	
cst92 270Conv2DBackpropFilter"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/17-InvertedResidual/conv-SequentialCell/2-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel�*
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�	:input�:filter_sizes**
dilation����*
kernel_size��*
group2
�
�


n

270 

268 271
make_tuple"3Default/network-TrainOneStepCell/optimizer-Momentum2


�

271 272AddN"3Default/network-TrainOneStepCell/optimizer-Momentum*	
n*
input_names �
:inputs*
output_names �:sum2
�
�


�

272 
	
cst93 273Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
�
�


�

features.17.conv.2.weight 
%
!moments.features.17.conv.2.weight 

222 

273 

momentum 274ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2
�
�


Z
	
cst67 

274 275depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

198 
	
cst94 276tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�

198 
	
cst95 277tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�

269 

features.17.conv.2.weight 
	
cst96 278Conv2DBackpropInput"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/17-InvertedResidual/conv-SequentialCell/2-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel�*
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�
:filter�:input_sizes**
dilation����*
kernel_size��*
group2
 
�


�

278 

199 279	ReLU6Grad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/17-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/2-ReLU6/gradReLU6*
output_names �
:output*&
input_names �
:y_grad�:x2
 
�


�

279 

197 
'
#features.17.conv.1.features.1.gamma 

277 

276 280FusedBatchNormGrad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/15-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm*8
output_names( �:dx�:bn_scale�:bn_bias*V
input_namesG �:dy�:x�	:scale�:	save_mean�:save_inv_variance*
epsilon-��'7*
momentum-���=2



�

280 
	
cst97 281tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

281 
	
cst98 282Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�
&
"features.17.conv.1.features.1.beta 
.
*moments.features.17.conv.1.features.1.beta 

222 

282 

momentum 283ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
Z
	
cst67 

283 284depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

280 
	
cst99 285tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

285 


cst100 286Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�
'
#features.17.conv.1.features.1.gamma 
/
+moments.features.17.conv.1.features.1.gamma 

222 

286 

momentum 287ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
Z
	
cst67 

287 288depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�
(
$features.17.conv.1.features.0.weight 


cst101 289Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2

�


�

280 


cst102 290tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
 
�


�

196 


cst103 

290 291#DepthwiseConv2dNativeBackpropFilter"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/17-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/0-DepthWiseConv/gradDepthwiseConv2dNative*
data_format:NCHW*&
pads����*(
stride����*:
input_names+ �	:input�:filter_size�:dout*
pad *
pad_mode:same*
channel_multiplier*
mode**
dilation����*
kernel_size��*
group*
output_names �
:output2

�


n

291 

289 292
make_tuple"3Default/network-TrainOneStepCell/optimizer-Momentum2


�

292 293AddN"3Default/network-TrainOneStepCell/optimizer-Momentum*	
n*
input_names �
:inputs*
output_names �:sum2

�


�

293 


cst104 294Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2

�


�
(
$features.17.conv.1.features.0.weight 
0
,moments.features.17.conv.1.features.0.weight 

222 

294 

momentum 295ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2

�


Z
	
cst67 

295 296depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

194 


cst105 297tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�

194 


cst106 298tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�


cst107 
(
$features.17.conv.1.features.0.weight 

290 299"DepthwiseConv2dNativeBackpropInput"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/17-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/0-DepthWiseConv/gradDepthwiseConv2dNative*
data_format:NCHW*&
pads����*(
stride����*:
input_names+ �:
input_size�
:filter�:dout*
pad *
pad_mode:same*
channel_multiplier*
mode**
dilation����*
kernel_size��*
group*
output_names �
:output2
 
�


�

299 

195 300	ReLU6Grad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/17-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/2-ReLU6/gradReLU6*
output_names �
:output*&
input_names �
:y_grad�:x2
 
�


�

300 

193 
'
#features.17.conv.0.features.1.gamma 

298 

297 301FusedBatchNormGrad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/15-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm*8
output_names( �:dx�:bn_scale�:bn_bias*V
input_namesG �:dy�:x�	:scale�:	save_mean�:save_inv_variance*
epsilon-��'7*
momentum-���=2



�

301 


cst108 302tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

302 


cst109 303Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�
&
"features.17.conv.0.features.1.beta 
.
*moments.features.17.conv.0.features.1.beta 

222 

303 

momentum 304ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
Z
	
cst67 

304 305depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

301 


cst110 306tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

306 


cst111 307Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�
'
#features.17.conv.0.features.1.gamma 
/
+moments.features.17.conv.0.features.1.gamma 

222 

307 

momentum 308ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
Z
	
cst67 

308 309depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�
(
$features.17.conv.0.features.0.weight 


cst112 310Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
�
�


�

301 


cst113 311tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
 
�


�

311 

192 


cst114 312Conv2DBackpropFilter"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/15-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/0-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel�*
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�	:input�:filter_sizes**
dilation����*
kernel_size��*
group2
�
�


n

312 

310 313
make_tuple"3Default/network-TrainOneStepCell/optimizer-Momentum2


�

313 314AddN"3Default/network-TrainOneStepCell/optimizer-Momentum*	
n*
input_names �
:inputs*
output_names �:sum2
�
�


�

314 


cst115 315Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
�
�


�
(
$features.17.conv.0.features.0.weight 
0
,moments.features.17.conv.0.features.0.weight 

222 

315 

momentum 316ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2
�
�


Z
	
cst67 

316 317depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

190 


cst116 318tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�

190 


cst117 319tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�

311 
(
$features.17.conv.0.features.0.weight 


cst118 320Conv2DBackpropInput"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/15-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/0-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel�*
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�
:filter�:input_sizes**
dilation����*
kernel_size��*
group2
 
�


�

320 

189 

features.16.conv.3.gamma 

319 

318 321FusedBatchNormGrad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/14-InvertedResidual/conv-SequentialCell/3-BatchNorm2d/gradFusedBatchNorm*8
output_names( �:dx�:bn_scale�:bn_bias*V
input_namesG �:dy�:x�	:scale�:	save_mean�:save_inv_variance*
epsilon-��'7*
momentum-���=2



�

321 


cst119 322tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

322 


cst120 323Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�

features.16.conv.3.beta 
#
moments.features.16.conv.3.beta 

222 

323 

momentum 324ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
Z
	
cst67 

324 325depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

321 


cst121 326tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

326 


cst122 327Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�

features.16.conv.3.gamma 
$
 moments.features.16.conv.3.gamma 

222 

327 

momentum 328ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
Z
	
cst67 

328 329depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

features.16.conv.2.weight 


cst123 330Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
�
�


�

321 


cst124 331tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
 
�


�

331 

188 


cst125 332Conv2DBackpropFilter"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/15-InvertedResidual/conv-SequentialCell/2-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel�*
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�	:input�:filter_sizes**
dilation����*
kernel_size��*
group2
�
�


n

332 

330 333
make_tuple"3Default/network-TrainOneStepCell/optimizer-Momentum2


�

333 334AddN"3Default/network-TrainOneStepCell/optimizer-Momentum*	
n*
input_names �
:inputs*
output_names �:sum2
�
�


�

334 


cst126 335Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
�
�


�

features.16.conv.2.weight 
%
!moments.features.16.conv.2.weight 

222 

335 

momentum 336ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2
�
�


Z
	
cst67 

336 337depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

186 


cst127 338tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�

186 


cst128 339tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�

331 

features.16.conv.2.weight 


cst129 340Conv2DBackpropInput"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/15-InvertedResidual/conv-SequentialCell/2-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel�*
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�
:filter�:input_sizes**
dilation����*
kernel_size��*
group2
 
�


�

340 

187 341	ReLU6Grad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/16-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/2-ReLU6/gradReLU6*
output_names �
:output*&
input_names �
:y_grad�:x2
 
�


�

341 

185 
'
#features.16.conv.1.features.1.gamma 

339 

338 342FusedBatchNormGrad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/15-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm*8
output_names( �:dx�:bn_scale�:bn_bias*V
input_namesG �:dy�:x�	:scale�:	save_mean�:save_inv_variance*
epsilon-��'7*
momentum-���=2



�

342 


cst130 343tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

343 


cst131 344Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�
&
"features.16.conv.1.features.1.beta 
.
*moments.features.16.conv.1.features.1.beta 

222 

344 

momentum 345ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
Z
	
cst67 

345 346depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

342 


cst132 347tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

347 


cst133 348Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�
'
#features.16.conv.1.features.1.gamma 
/
+moments.features.16.conv.1.features.1.gamma 

222 

348 

momentum 349ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
Z
	
cst67 

349 350depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�
(
$features.16.conv.1.features.0.weight 


cst134 351Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2

�


�

342 


cst135 352tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
 
�


�

184 


cst136 

352 353#DepthwiseConv2dNativeBackpropFilter"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/16-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/0-DepthWiseConv/gradDepthwiseConv2dNative*
data_format:NCHW*&
pads����*(
stride����*:
input_names+ �	:input�:filter_size�:dout*
pad *
pad_mode:same*
channel_multiplier*
mode**
dilation����*
kernel_size��*
group*
output_names �
:output2

�


n

353 

351 354
make_tuple"3Default/network-TrainOneStepCell/optimizer-Momentum2


�

354 355AddN"3Default/network-TrainOneStepCell/optimizer-Momentum*	
n*
input_names �
:inputs*
output_names �:sum2

�


�

355 


cst137 356Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2

�


�
(
$features.16.conv.1.features.0.weight 
0
,moments.features.16.conv.1.features.0.weight 

222 

356 

momentum 357ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2

�


Z
	
cst67 

357 358depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

182 


cst138 359tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�

182 


cst139 360tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�


cst140 
(
$features.16.conv.1.features.0.weight 

352 361"DepthwiseConv2dNativeBackpropInput"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/16-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/0-DepthWiseConv/gradDepthwiseConv2dNative*
data_format:NCHW*&
pads����*(
stride����*:
input_names+ �:
input_size�
:filter�:dout*
pad *
pad_mode:same*
channel_multiplier*
mode**
dilation����*
kernel_size��*
group*
output_names �
:output2
 
�


�

361 

183 362	ReLU6Grad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/16-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/2-ReLU6/gradReLU6*
output_names �
:output*&
input_names �
:y_grad�:x2
 
�


�

362 

181 
'
#features.16.conv.0.features.1.gamma 

360 

359 363FusedBatchNormGrad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/15-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm*8
output_names( �:dx�:bn_scale�:bn_bias*V
input_namesG �:dy�:x�	:scale�:	save_mean�:save_inv_variance*
epsilon-��'7*
momentum-���=2



�

363 


cst141 364tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

364 


cst142 365Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�
&
"features.16.conv.0.features.1.beta 
.
*moments.features.16.conv.0.features.1.beta 

222 

365 

momentum 366ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
Z
	
cst67 

366 367depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

363 


cst143 368tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

368 


cst144 369Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�
'
#features.16.conv.0.features.1.gamma 
/
+moments.features.16.conv.0.features.1.gamma 

222 

369 

momentum 370ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
Z
	
cst67 

370 371depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�
(
$features.16.conv.0.features.0.weight 


cst145 372Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
�
�


�

363 


cst146 373tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
 
�


�

373 

180 


cst114 374Conv2DBackpropFilter"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/15-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/0-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel�*
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�	:input�:filter_sizes**
dilation����*
kernel_size��*
group2
�
�


n

374 

372 375
make_tuple"3Default/network-TrainOneStepCell/optimizer-Momentum2


�

375 376AddN"3Default/network-TrainOneStepCell/optimizer-Momentum*	
n*
input_names �
:inputs*
output_names �:sum2
�
�


�

376 


cst147 377Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
�
�


�
(
$features.16.conv.0.features.0.weight 
0
,moments.features.16.conv.0.features.0.weight 

222 

377 

momentum 378ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2
�
�


Z
	
cst67 

378 379depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

178 


cst148 380tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�

178 


cst149 381tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�

373 
(
$features.16.conv.0.features.0.weight 


cst118 382Conv2DBackpropInput"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/15-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/0-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel�*
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�
:filter�:input_sizes**
dilation����*
kernel_size��*
group2
 
�


�

382 

320 383
make_tuple"wDefault/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/15-InvertedResidual2


�

383 384AddN"wDefault/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/15-InvertedResidual*	
n*
input_names �
:inputs*
output_names �:sum2
 
�


�

384 

177 

features.15.conv.3.gamma 

381 

380 385FusedBatchNormGrad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/14-InvertedResidual/conv-SequentialCell/3-BatchNorm2d/gradFusedBatchNorm*8
output_names( �:dx�:bn_scale�:bn_bias*V
input_namesG �:dy�:x�	:scale�:	save_mean�:save_inv_variance*
epsilon-��'7*
momentum-���=2



�

385 


cst150 386tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

386 


cst151 387Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�

features.15.conv.3.beta 
#
moments.features.15.conv.3.beta 

222 

387 

momentum 388ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
Z
	
cst67 

388 389depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

385 


cst152 390tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

390 


cst153 391Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�

features.15.conv.3.gamma 
$
 moments.features.15.conv.3.gamma 

222 

391 

momentum 392ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
Z
	
cst67 

392 393depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

features.15.conv.2.weight 


cst154 394Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
�
�


�

385 


cst155 395tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
 
�


�

395 

176 


cst125 396Conv2DBackpropFilter"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/15-InvertedResidual/conv-SequentialCell/2-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel�*
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�	:input�:filter_sizes**
dilation����*
kernel_size��*
group2
�
�


n

396 

394 397
make_tuple"3Default/network-TrainOneStepCell/optimizer-Momentum2


�

397 398AddN"3Default/network-TrainOneStepCell/optimizer-Momentum*	
n*
input_names �
:inputs*
output_names �:sum2
�
�


�

398 


cst156 399Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
�
�


�

features.15.conv.2.weight 
%
!moments.features.15.conv.2.weight 

222 

399 

momentum 400ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2
�
�


Z
	
cst67 

400 401depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

174 


cst157 402tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�

174 


cst158 403tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�

395 

features.15.conv.2.weight 


cst159 404Conv2DBackpropInput"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/15-InvertedResidual/conv-SequentialCell/2-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel�*
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�
:filter�:input_sizes**
dilation����*
kernel_size��*
group2
 
�


�

404 

175 405	ReLU6Grad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/15-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/2-ReLU6/gradReLU6*
output_names �
:output*&
input_names �
:y_grad�:x2
 
�


�

405 

173 
'
#features.15.conv.1.features.1.gamma 

403 

402 406FusedBatchNormGrad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/15-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm*8
output_names( �:dx�:bn_scale�:bn_bias*V
input_namesG �:dy�:x�	:scale�:	save_mean�:save_inv_variance*
epsilon-��'7*
momentum-���=2



�

406 


cst160 407tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

407 


cst161 408Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�
&
"features.15.conv.1.features.1.beta 
.
*moments.features.15.conv.1.features.1.beta 

222 

408 

momentum 409ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
Z
	
cst67 

409 410depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

406 


cst162 411tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

411 


cst163 412Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�
'
#features.15.conv.1.features.1.gamma 
/
+moments.features.15.conv.1.features.1.gamma 

222 

412 

momentum 413ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
Z
	
cst67 

413 414depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�
(
$features.15.conv.1.features.0.weight 


cst164 415Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2

�


�

406 


cst165 416tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
 
�


�

172 


cst166 

416 417#DepthwiseConv2dNativeBackpropFilter"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/15-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/0-DepthWiseConv/gradDepthwiseConv2dNative*
data_format:NCHW*&
pads����*(
stride����*:
input_names+ �	:input�:filter_size�:dout*
pad *
pad_mode:same*
channel_multiplier*
mode**
dilation����*
kernel_size��*
group*
output_names �
:output2

�


n

417 

415 418
make_tuple"3Default/network-TrainOneStepCell/optimizer-Momentum2


�

418 419AddN"3Default/network-TrainOneStepCell/optimizer-Momentum*	
n*
input_names �
:inputs*
output_names �:sum2

�


�

419 


cst167 420Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2

�


�
(
$features.15.conv.1.features.0.weight 
0
,moments.features.15.conv.1.features.0.weight 

222 

420 

momentum 421ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2

�


Z
	
cst67 

421 422depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

170 


cst168 423tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�

170 


cst169 424tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�


cst170 
(
$features.15.conv.1.features.0.weight 

416 425"DepthwiseConv2dNativeBackpropInput"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/15-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/0-DepthWiseConv/gradDepthwiseConv2dNative*
data_format:NCHW*&
pads����*(
stride����*:
input_names+ �:
input_size�
:filter�:dout*
pad *
pad_mode:same*
channel_multiplier*
mode**
dilation����*
kernel_size��*
group*
output_names �
:output2
 
�


�

425 

171 426	ReLU6Grad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/15-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/2-ReLU6/gradReLU6*
output_names �
:output*&
input_names �
:y_grad�:x2
 
�


�

426 

169 
'
#features.15.conv.0.features.1.gamma 

424 

423 427FusedBatchNormGrad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/15-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm*8
output_names( �:dx�:bn_scale�:bn_bias*V
input_namesG �:dy�:x�	:scale�:	save_mean�:save_inv_variance*
epsilon-��'7*
momentum-���=2



�

427 


cst171 428tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

428 


cst172 429Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�
&
"features.15.conv.0.features.1.beta 
.
*moments.features.15.conv.0.features.1.beta 

222 

429 

momentum 430ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
Z
	
cst67 

430 431depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

427 


cst173 432tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

432 


cst174 433Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�
'
#features.15.conv.0.features.1.gamma 
/
+moments.features.15.conv.0.features.1.gamma 

222 

433 

momentum 434ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
Z
	
cst67 

434 435depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�
(
$features.15.conv.0.features.0.weight 


cst175 436Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
�
�


�

427 


cst176 437tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
 
�


�

437 

168 


cst114 438Conv2DBackpropFilter"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/15-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/0-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel�*
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�	:input�:filter_sizes**
dilation����*
kernel_size��*
group2
�
�


n

438 

436 439
make_tuple"3Default/network-TrainOneStepCell/optimizer-Momentum2


�

439 440AddN"3Default/network-TrainOneStepCell/optimizer-Momentum*	
n*
input_names �
:inputs*
output_names �:sum2
�
�


�

440 


cst177 441Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
�
�


�
(
$features.15.conv.0.features.0.weight 
0
,moments.features.15.conv.0.features.0.weight 

222 

441 

momentum 442ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2
�
�


Z
	
cst67 

442 443depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

167 


cst178 444tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�

167 


cst179 445tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�

437 
(
$features.15.conv.0.features.0.weight 


cst118 446Conv2DBackpropInput"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/15-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/0-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel�*
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�
:filter�:input_sizes**
dilation����*
kernel_size��*
group2
 
�


�

446 

384 447
make_tuple"wDefault/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/15-InvertedResidual2


�

447 448AddN"wDefault/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/15-InvertedResidual*	
n*
input_names �
:inputs*
output_names �:sum2
 
�


�

448 

166 

features.14.conv.3.gamma 

445 

444 449FusedBatchNormGrad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/14-InvertedResidual/conv-SequentialCell/3-BatchNorm2d/gradFusedBatchNorm*8
output_names( �:dx�:bn_scale�:bn_bias*V
input_namesG �:dy�:x�	:scale�:	save_mean�:save_inv_variance*
epsilon-��'7*
momentum-���=2



�

449 


cst180 450tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

450 


cst181 451Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�

features.14.conv.3.beta 
#
moments.features.14.conv.3.beta 

222 

451 

momentum 452ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
Z
	
cst67 

452 453depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

449 


cst182 454tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

454 


cst183 455Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�

features.14.conv.3.gamma 
$
 moments.features.14.conv.3.gamma 

222 

455 

momentum 456ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
Z
	
cst67 

456 457depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

features.14.conv.2.weight 


cst184 458Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
�
�


�

449 


cst185 459tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
 
�


�

459 

165 


cst186 460Conv2DBackpropFilter"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/14-InvertedResidual/conv-SequentialCell/2-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel�*
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�	:input�:filter_sizes**
dilation����*
kernel_size��*
group2
�
�


n

460 

458 461
make_tuple"3Default/network-TrainOneStepCell/optimizer-Momentum2


�

461 462AddN"3Default/network-TrainOneStepCell/optimizer-Momentum*	
n*
input_names �
:inputs*
output_names �:sum2
�
�


�

462 


cst187 463Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
�
�


�

features.14.conv.2.weight 
%
!moments.features.14.conv.2.weight 

222 

463 

momentum 464ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2
�
�


Z
	
cst67 

464 465depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

163 


cst188 466tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�

163 


cst189 467tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�

459 

features.14.conv.2.weight 


cst190 468Conv2DBackpropInput"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/14-InvertedResidual/conv-SequentialCell/2-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel�*
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�
:filter�:input_sizes**
dilation����*
kernel_size��*
group2
 
�


�

468 

164 469	ReLU6Grad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/14-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/2-ReLU6/gradReLU6*
output_names �
:output*&
input_names �
:y_grad�:x2
 
�


�

469 

162 
'
#features.14.conv.1.features.1.gamma 

467 

466 470FusedBatchNormGrad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/12-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm*8
output_names( �:dx�:bn_scale�:bn_bias*V
input_namesG �:dy�:x�	:scale�:	save_mean�:save_inv_variance*
epsilon-��'7*
momentum-���=2



�

470 


cst191 471tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

471 


cst192 472Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�
&
"features.14.conv.1.features.1.beta 
.
*moments.features.14.conv.1.features.1.beta 

222 

472 

momentum 473ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
Z
	
cst67 

473 474depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

470 


cst193 475tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

475 


cst194 476Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�
'
#features.14.conv.1.features.1.gamma 
/
+moments.features.14.conv.1.features.1.gamma 

222 

476 

momentum 477ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
Z
	
cst67 

477 478depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�
(
$features.14.conv.1.features.0.weight 


cst195 479Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2

�


�

470 


cst196 480tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
 
�


�

161 


cst197 

480 481#DepthwiseConv2dNativeBackpropFilter"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/14-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/0-DepthWiseConv/gradDepthwiseConv2dNative*
data_format:NCHW*&
pads� �� �*(
stride����*:
input_names+ �	:input�:filter_size�:dout*
pad *
pad_mode:same*
channel_multiplier*
mode**
dilation����*
kernel_size��*
group*
output_names �
:output2

�


n

481 

479 482
make_tuple"3Default/network-TrainOneStepCell/optimizer-Momentum2


�

482 483AddN"3Default/network-TrainOneStepCell/optimizer-Momentum*	
n*
input_names �
:inputs*
output_names �:sum2

�


�

483 


cst198 484Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2

�


�
(
$features.14.conv.1.features.0.weight 
0
,moments.features.14.conv.1.features.0.weight 

222 

484 

momentum 485ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2

�


Z
	
cst67 

485 486depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

159 


cst199 487tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�

159 


cst200 488tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�


cst201 
(
$features.14.conv.1.features.0.weight 

480 489"DepthwiseConv2dNativeBackpropInput"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/14-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/0-DepthWiseConv/gradDepthwiseConv2dNative*
data_format:NCHW*&
pads� �� �*(
stride����*:
input_names+ �:
input_size�
:filter�:dout*
pad *
pad_mode:same*
channel_multiplier*
mode**
dilation����*
kernel_size��*
group*
output_names �
:output2
 
�


�

489 

160 490	ReLU6Grad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/14-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/2-ReLU6/gradReLU6*
output_names �
:output*&
input_names �
:y_grad�:x2
 
�


�

490 

158 
'
#features.14.conv.0.features.1.gamma 

488 

487 491FusedBatchNormGrad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/12-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm*8
output_names( �:dx�:bn_scale�:bn_bias*V
input_namesG �:dy�:x�	:scale�:	save_mean�:save_inv_variance*
epsilon-��'7*
momentum-���=2



�

491 


cst202 492tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

492 


cst203 493Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�
&
"features.14.conv.0.features.1.beta 
.
*moments.features.14.conv.0.features.1.beta 

222 

493 

momentum 494ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
Z
	
cst67 

494 495depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

491 


cst204 496tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

496 


cst205 497Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�
'
#features.14.conv.0.features.1.gamma 
/
+moments.features.14.conv.0.features.1.gamma 

222 

497 

momentum 498ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
Z
	
cst67 

498 499depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�
(
$features.14.conv.0.features.0.weight 


cst206 500Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
�
`


�

491 


cst207 501tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
 
�


�

501 

157 


cst208 502Conv2DBackpropFilter"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/12-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/0-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel�*
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�	:input�:filter_sizes**
dilation����*
kernel_size��*
group2
�
`


n

502 

500 503
make_tuple"3Default/network-TrainOneStepCell/optimizer-Momentum2


�

503 504AddN"3Default/network-TrainOneStepCell/optimizer-Momentum*	
n*
input_names �
:inputs*
output_names �:sum2
�
`


�

504 


cst209 505Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
�
`


�
(
$features.14.conv.0.features.0.weight 
0
,moments.features.14.conv.0.features.0.weight 

222 

505 

momentum 506ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2
�
`


Z
	
cst67 

506 507depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

155 


cst210 508tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2
`
�

155 


cst211 509tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2
`
�

501 
(
$features.14.conv.0.features.0.weight 


cst212 510Conv2DBackpropInput"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/12-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/0-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel�*
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�
:filter�:input_sizes**
dilation����*
kernel_size��*
group2
 
`


�

510 

154 

features.13.conv.3.gamma 

509 

508 511FusedBatchNormGrad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/11-InvertedResidual/conv-SequentialCell/3-BatchNorm2d/gradFusedBatchNorm*8
output_names( �:dx�:bn_scale�:bn_bias*V
input_namesG �:dy�:x�	:scale�:	save_mean�:save_inv_variance*
epsilon-��'7*
momentum-���=2



�

511 


cst213 512tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
`
�

512 


cst214 513Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
`
�

features.13.conv.3.beta 
#
moments.features.13.conv.3.beta 

222 

513 

momentum 514ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2
`
Z
	
cst67 

514 515depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

511 


cst215 516tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
`
�

516 


cst216 517Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
`
�

features.13.conv.3.gamma 
$
 moments.features.13.conv.3.gamma 

222 

517 

momentum 518ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2
`
Z
	
cst67 

518 519depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

features.13.conv.2.weight 


cst217 520Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
`
�


�

511 


cst218 521tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
 
`


�

521 

153 


cst219 522Conv2DBackpropFilter"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/12-InvertedResidual/conv-SequentialCell/2-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel`*
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�	:input�:filter_sizes**
dilation����*
kernel_size��*
group2
`
�


n

522 

520 523
make_tuple"3Default/network-TrainOneStepCell/optimizer-Momentum2


�

523 524AddN"3Default/network-TrainOneStepCell/optimizer-Momentum*	
n*
input_names �
:inputs*
output_names �:sum2
`
�


�

524 


cst220 525Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
`
�


�

features.13.conv.2.weight 
%
!moments.features.13.conv.2.weight 

222 

525 

momentum 526ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2
`
�


Z
	
cst67 

526 527depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

151 


cst221 528tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�

151 


cst222 529tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�

521 

features.13.conv.2.weight 


cst223 530Conv2DBackpropInput"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/12-InvertedResidual/conv-SequentialCell/2-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel`*
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�
:filter�:input_sizes**
dilation����*
kernel_size��*
group2
 
�


�

530 

152 531	ReLU6Grad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/13-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/2-ReLU6/gradReLU6*
output_names �
:output*&
input_names �
:y_grad�:x2
 
�


�

531 

150 
'
#features.13.conv.1.features.1.gamma 

529 

528 532FusedBatchNormGrad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/12-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm*8
output_names( �:dx�:bn_scale�:bn_bias*V
input_namesG �:dy�:x�	:scale�:	save_mean�:save_inv_variance*
epsilon-��'7*
momentum-���=2



�

532 


cst224 533tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

533 


cst225 534Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�
&
"features.13.conv.1.features.1.beta 
.
*moments.features.13.conv.1.features.1.beta 

222 

534 

momentum 535ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
Z
	
cst67 

535 536depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

532 


cst226 537tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

537 


cst227 538Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�
'
#features.13.conv.1.features.1.gamma 
/
+moments.features.13.conv.1.features.1.gamma 

222 

538 

momentum 539ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
Z
	
cst67 

539 540depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�
(
$features.13.conv.1.features.0.weight 


cst228 541Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2

�


�

532 


cst229 542tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
 
�


�

149 


cst230 

542 543#DepthwiseConv2dNativeBackpropFilter"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/13-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/0-DepthWiseConv/gradDepthwiseConv2dNative*
data_format:NCHW*&
pads����*(
stride����*:
input_names+ �	:input�:filter_size�:dout*
pad *
pad_mode:same*
channel_multiplier*
mode**
dilation����*
kernel_size��*
group*
output_names �
:output2

�


n

543 

541 544
make_tuple"3Default/network-TrainOneStepCell/optimizer-Momentum2


�

544 545AddN"3Default/network-TrainOneStepCell/optimizer-Momentum*	
n*
input_names �
:inputs*
output_names �:sum2

�


�

545 


cst231 546Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2

�


�
(
$features.13.conv.1.features.0.weight 
0
,moments.features.13.conv.1.features.0.weight 

222 

546 

momentum 547ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2

�


Z
	
cst67 

547 548depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

147 


cst232 549tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�

147 


cst233 550tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�


cst234 
(
$features.13.conv.1.features.0.weight 

542 551"DepthwiseConv2dNativeBackpropInput"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/13-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/0-DepthWiseConv/gradDepthwiseConv2dNative*
data_format:NCHW*&
pads����*(
stride����*:
input_names+ �:
input_size�
:filter�:dout*
pad *
pad_mode:same*
channel_multiplier*
mode**
dilation����*
kernel_size��*
group*
output_names �
:output2
 
�


�

551 

148 552	ReLU6Grad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/13-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/2-ReLU6/gradReLU6*
output_names �
:output*&
input_names �
:y_grad�:x2
 
�


�

552 

146 
'
#features.13.conv.0.features.1.gamma 

550 

549 553FusedBatchNormGrad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/12-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm*8
output_names( �:dx�:bn_scale�:bn_bias*V
input_namesG �:dy�:x�	:scale�:	save_mean�:save_inv_variance*
epsilon-��'7*
momentum-���=2



�

553 


cst235 554tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

554 


cst236 555Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�
&
"features.13.conv.0.features.1.beta 
.
*moments.features.13.conv.0.features.1.beta 

222 

555 

momentum 556ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
Z
	
cst67 

556 557depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

553 


cst237 558tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

558 


cst238 559Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�
'
#features.13.conv.0.features.1.gamma 
/
+moments.features.13.conv.0.features.1.gamma 

222 

559 

momentum 560ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
Z
	
cst67 

560 561depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�
(
$features.13.conv.0.features.0.weight 


cst239 562Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
�
`


�

553 


cst240 563tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
 
�


�

563 

145 


cst208 564Conv2DBackpropFilter"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/12-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/0-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel�*
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�	:input�:filter_sizes**
dilation����*
kernel_size��*
group2
�
`


n

564 

562 565
make_tuple"3Default/network-TrainOneStepCell/optimizer-Momentum2


�

565 566AddN"3Default/network-TrainOneStepCell/optimizer-Momentum*	
n*
input_names �
:inputs*
output_names �:sum2
�
`


�

566 


cst241 567Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
�
`


�
(
$features.13.conv.0.features.0.weight 
0
,moments.features.13.conv.0.features.0.weight 

222 

567 

momentum 568ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2
�
`


Z
	
cst67 

568 569depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

143 


cst242 570tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2
`
�

143 


cst243 571tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2
`
�

563 
(
$features.13.conv.0.features.0.weight 


cst212 572Conv2DBackpropInput"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/12-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/0-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel�*
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�
:filter�:input_sizes**
dilation����*
kernel_size��*
group2
 
`


�

572 

510 573
make_tuple"wDefault/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/12-InvertedResidual2


�

573 574AddN"wDefault/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/12-InvertedResidual*	
n*
input_names �
:inputs*
output_names �:sum2
 
`


�

574 

142 

features.12.conv.3.gamma 

571 

570 575FusedBatchNormGrad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/11-InvertedResidual/conv-SequentialCell/3-BatchNorm2d/gradFusedBatchNorm*8
output_names( �:dx�:bn_scale�:bn_bias*V
input_namesG �:dy�:x�	:scale�:	save_mean�:save_inv_variance*
epsilon-��'7*
momentum-���=2



�

575 


cst244 576tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
`
�

576 


cst245 577Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
`
�

features.12.conv.3.beta 
#
moments.features.12.conv.3.beta 

222 

577 

momentum 578ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2
`
Z
	
cst67 

578 579depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

575 


cst246 580tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
`
�

580 


cst247 581Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
`
�

features.12.conv.3.gamma 
$
 moments.features.12.conv.3.gamma 

222 

581 

momentum 582ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2
`
Z
	
cst67 

582 583depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

features.12.conv.2.weight 


cst248 584Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
`
�


�

575 


cst249 585tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
 
`


�

585 

141 


cst219 586Conv2DBackpropFilter"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/12-InvertedResidual/conv-SequentialCell/2-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel`*
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�	:input�:filter_sizes**
dilation����*
kernel_size��*
group2
`
�


n

586 

584 587
make_tuple"3Default/network-TrainOneStepCell/optimizer-Momentum2


�

587 588AddN"3Default/network-TrainOneStepCell/optimizer-Momentum*	
n*
input_names �
:inputs*
output_names �:sum2
`
�


�

588 


cst250 589Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
`
�


�

features.12.conv.2.weight 
%
!moments.features.12.conv.2.weight 

222 

589 

momentum 590ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2
`
�


Z
	
cst67 

590 591depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

139 


cst251 592tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�

139 


cst252 593tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�

585 

features.12.conv.2.weight 


cst253 594Conv2DBackpropInput"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/12-InvertedResidual/conv-SequentialCell/2-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel`*
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�
:filter�:input_sizes**
dilation����*
kernel_size��*
group2
 
�


�

594 

140 595	ReLU6Grad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/12-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/2-ReLU6/gradReLU6*
output_names �
:output*&
input_names �
:y_grad�:x2
 
�


�

595 

138 
'
#features.12.conv.1.features.1.gamma 

593 

592 596FusedBatchNormGrad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/12-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm*8
output_names( �:dx�:bn_scale�:bn_bias*V
input_namesG �:dy�:x�	:scale�:	save_mean�:save_inv_variance*
epsilon-��'7*
momentum-���=2



�

596 


cst254 597tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

597 


cst255 598Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�
&
"features.12.conv.1.features.1.beta 
.
*moments.features.12.conv.1.features.1.beta 

222 

598 

momentum 599ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
Z
	
cst67 

599 600depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

596 


cst256 601tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

601 


cst257 602Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�
'
#features.12.conv.1.features.1.gamma 
/
+moments.features.12.conv.1.features.1.gamma 

222 

602 

momentum 603ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
Z
	
cst67 

603 604depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�
(
$features.12.conv.1.features.0.weight 


cst258 605Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2

�


�

596 


cst259 606tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
 
�


�

137 


cst260 

606 607#DepthwiseConv2dNativeBackpropFilter"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/12-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/0-DepthWiseConv/gradDepthwiseConv2dNative*
data_format:NCHW*&
pads����*(
stride����*:
input_names+ �	:input�:filter_size�:dout*
pad *
pad_mode:same*
channel_multiplier*
mode**
dilation����*
kernel_size��*
group*
output_names �
:output2

�


n

607 

605 608
make_tuple"3Default/network-TrainOneStepCell/optimizer-Momentum2


�

608 609AddN"3Default/network-TrainOneStepCell/optimizer-Momentum*	
n*
input_names �
:inputs*
output_names �:sum2

�


�

609 


cst261 610Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2

�


�
(
$features.12.conv.1.features.0.weight 
0
,moments.features.12.conv.1.features.0.weight 

222 

610 

momentum 611ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2

�


Z
	
cst67 

611 612depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

135 


cst262 613tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�

135 


cst263 614tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�


cst264 
(
$features.12.conv.1.features.0.weight 

606 615"DepthwiseConv2dNativeBackpropInput"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/12-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/0-DepthWiseConv/gradDepthwiseConv2dNative*
data_format:NCHW*&
pads����*(
stride����*:
input_names+ �:
input_size�
:filter�:dout*
pad *
pad_mode:same*
channel_multiplier*
mode**
dilation����*
kernel_size��*
group*
output_names �
:output2
 
�


�

615 

136 616	ReLU6Grad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/12-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/2-ReLU6/gradReLU6*
output_names �
:output*&
input_names �
:y_grad�:x2
 
�


�

616 

134 
'
#features.12.conv.0.features.1.gamma 

614 

613 617FusedBatchNormGrad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/12-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm*8
output_names( �:dx�:bn_scale�:bn_bias*V
input_namesG �:dy�:x�	:scale�:	save_mean�:save_inv_variance*
epsilon-��'7*
momentum-���=2



�

617 


cst265 618tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

618 


cst266 619Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�
&
"features.12.conv.0.features.1.beta 
.
*moments.features.12.conv.0.features.1.beta 

222 

619 

momentum 620ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
Z
	
cst67 

620 621depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

617 


cst267 622tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

622 


cst268 623Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�
'
#features.12.conv.0.features.1.gamma 
/
+moments.features.12.conv.0.features.1.gamma 

222 

623 

momentum 624ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
Z
	
cst67 

624 625depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�
(
$features.12.conv.0.features.0.weight 


cst269 626Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
�
`


�

617 


cst270 627tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
 
�


�

627 

133 


cst208 628Conv2DBackpropFilter"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/12-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/0-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel�*
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�	:input�:filter_sizes**
dilation����*
kernel_size��*
group2
�
`


n

628 

626 629
make_tuple"3Default/network-TrainOneStepCell/optimizer-Momentum2


�

629 630AddN"3Default/network-TrainOneStepCell/optimizer-Momentum*	
n*
input_names �
:inputs*
output_names �:sum2
�
`


�

630 


cst271 631Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
�
`


�
(
$features.12.conv.0.features.0.weight 
0
,moments.features.12.conv.0.features.0.weight 

222 

631 

momentum 632ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2
�
`


Z
	
cst67 

632 633depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

132 


cst272 634tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2
`
�

132 


cst273 635tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2
`
�

627 
(
$features.12.conv.0.features.0.weight 


cst212 636Conv2DBackpropInput"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/12-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/0-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel�*
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�
:filter�:input_sizes**
dilation����*
kernel_size��*
group2
 
`


�

636 

574 637
make_tuple"wDefault/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/12-InvertedResidual2


�

637 638AddN"wDefault/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/12-InvertedResidual*	
n*
input_names �
:inputs*
output_names �:sum2
 
`


�

638 

131 

features.11.conv.3.gamma 

635 

634 639FusedBatchNormGrad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/11-InvertedResidual/conv-SequentialCell/3-BatchNorm2d/gradFusedBatchNorm*8
output_names( �:dx�:bn_scale�:bn_bias*V
input_namesG �:dy�:x�	:scale�:	save_mean�:save_inv_variance*
epsilon-��'7*
momentum-���=2



�

639 


cst274 640tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
`
�

640 


cst275 641Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
`
�

features.11.conv.3.beta 
#
moments.features.11.conv.3.beta 

222 

641 

momentum 642ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2
`
Z
	
cst67 

642 643depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

639 


cst276 644tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
`
�

644 


cst277 645Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
`
�

features.11.conv.3.gamma 
$
 moments.features.11.conv.3.gamma 

222 

645 

momentum 646ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2
`
Z
	
cst67 

646 647depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

features.11.conv.2.weight 


cst278 648Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
`
�


�

639 


cst279 649tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
 
`


�

649 

130 


cst280 650Conv2DBackpropFilter"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/11-InvertedResidual/conv-SequentialCell/2-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel`*
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�	:input�:filter_sizes**
dilation����*
kernel_size��*
group2
`
�


n

650 

648 651
make_tuple"3Default/network-TrainOneStepCell/optimizer-Momentum2


�

651 652AddN"3Default/network-TrainOneStepCell/optimizer-Momentum*	
n*
input_names �
:inputs*
output_names �:sum2
`
�


�

652 


cst281 653Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
`
�


�

features.11.conv.2.weight 
%
!moments.features.11.conv.2.weight 

222 

653 

momentum 654ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2
`
�


Z
	
cst67 

654 655depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

128 


cst282 656tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�

128 


cst283 657tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�

649 

features.11.conv.2.weight 


cst284 658Conv2DBackpropInput"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/11-InvertedResidual/conv-SequentialCell/2-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel`*
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�
:filter�:input_sizes**
dilation����*
kernel_size��*
group2
 
�


�

658 

129 659	ReLU6Grad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/11-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/2-ReLU6/gradReLU6*
output_names �
:output*&
input_names �
:y_grad�:x2
 
�


�

659 

127 
'
#features.11.conv.1.features.1.gamma 

657 

656 660FusedBatchNormGrad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/8-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm*8
output_names( �:dx�:bn_scale�:bn_bias*V
input_namesG �:dy�:x�	:scale�:	save_mean�:save_inv_variance*
epsilon-��'7*
momentum-���=2



�

660 


cst285 661tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

661 


cst286 662Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�
&
"features.11.conv.1.features.1.beta 
.
*moments.features.11.conv.1.features.1.beta 

222 

662 

momentum 663ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
Z
	
cst67 

663 664depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

660 


cst287 665tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

665 


cst288 666Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�
'
#features.11.conv.1.features.1.gamma 
/
+moments.features.11.conv.1.features.1.gamma 

222 

666 

momentum 667ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
Z
	
cst67 

667 668depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�
(
$features.11.conv.1.features.0.weight 


cst289 669Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2

�


�

660 


cst290 670tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
 
�


�

126 


cst291 

670 671#DepthwiseConv2dNativeBackpropFilter"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/11-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/0-DepthWiseConv/gradDepthwiseConv2dNative*
data_format:NCHW*&
pads����*(
stride����*:
input_names+ �	:input�:filter_size�:dout*
pad *
pad_mode:same*
channel_multiplier*
mode**
dilation����*
kernel_size��*
group*
output_names �
:output2

�


n

671 

669 672
make_tuple"3Default/network-TrainOneStepCell/optimizer-Momentum2


�

672 673AddN"3Default/network-TrainOneStepCell/optimizer-Momentum*	
n*
input_names �
:inputs*
output_names �:sum2

�


�

673 


cst292 674Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2

�


�
(
$features.11.conv.1.features.0.weight 
0
,moments.features.11.conv.1.features.0.weight 

222 

674 

momentum 675ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2

�


Z
	
cst67 

675 676depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

124 


cst293 677tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�

124 


cst294 678tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�


cst295 
(
$features.11.conv.1.features.0.weight 

670 679"DepthwiseConv2dNativeBackpropInput"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/11-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/0-DepthWiseConv/gradDepthwiseConv2dNative*
data_format:NCHW*&
pads����*(
stride����*:
input_names+ �:
input_size�
:filter�:dout*
pad *
pad_mode:same*
channel_multiplier*
mode**
dilation����*
kernel_size��*
group*
output_names �
:output2
 
�


�

679 

125 680	ReLU6Grad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/11-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/2-ReLU6/gradReLU6*
output_names �
:output*&
input_names �
:y_grad�:x2
 
�


�

680 

123 
'
#features.11.conv.0.features.1.gamma 

678 

677 681FusedBatchNormGrad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/8-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm*8
output_names( �:dx�:bn_scale�:bn_bias*V
input_namesG �:dy�:x�	:scale�:	save_mean�:save_inv_variance*
epsilon-��'7*
momentum-���=2



�

681 


cst296 682tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

682 


cst297 683Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�
&
"features.11.conv.0.features.1.beta 
.
*moments.features.11.conv.0.features.1.beta 

222 

683 

momentum 684ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
Z
	
cst67 

684 685depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

681 


cst298 686tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

686 


cst299 687Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�
'
#features.11.conv.0.features.1.gamma 
/
+moments.features.11.conv.0.features.1.gamma 

222 

687 

momentum 688ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
Z
	
cst67 

688 689depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�
(
$features.11.conv.0.features.0.weight 


cst300 690Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
�
@


�

681 


cst301 691tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
 
�


�

691 

122 


cst302 692Conv2DBackpropFilter"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/8-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/0-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel�*
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�	:input�:filter_sizes**
dilation����*
kernel_size��*
group2
�
@


n

692 

690 693
make_tuple"3Default/network-TrainOneStepCell/optimizer-Momentum2


�

693 694AddN"3Default/network-TrainOneStepCell/optimizer-Momentum*	
n*
input_names �
:inputs*
output_names �:sum2
�
@


�

694 


cst303 695Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
�
@


�
(
$features.11.conv.0.features.0.weight 
0
,moments.features.11.conv.0.features.0.weight 

222 

695 

momentum 696ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2
�
@


Z
	
cst67 

696 697depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

120 


cst304 698tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2
@
�

120 


cst305 699tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2
@
�

691 
(
$features.11.conv.0.features.0.weight 


cst306 700Conv2DBackpropInput"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/8-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/0-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel�*
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�
:filter�:input_sizes**
dilation����*
kernel_size��*
group2
 
@


�

700 

119 

features.10.conv.3.gamma 

699 

698 701FusedBatchNormGrad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/7-InvertedResidual/conv-SequentialCell/3-BatchNorm2d/gradFusedBatchNorm*8
output_names( �:dx�:bn_scale�:bn_bias*V
input_namesG �:dy�:x�	:scale�:	save_mean�:save_inv_variance*
epsilon-��'7*
momentum-���=2



�

701 


cst307 702tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
@
�

702 


cst308 703Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
@
�

features.10.conv.3.beta 
#
moments.features.10.conv.3.beta 

222 

703 

momentum 704ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2
@
Z
	
cst67 

704 705depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

701 


cst309 706tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
@
�

706 


cst310 707Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
@
�

features.10.conv.3.gamma 
$
 moments.features.10.conv.3.gamma 

222 

707 

momentum 708ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2
@
Z
	
cst67 

708 709depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

features.10.conv.2.weight 


cst311 710Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
@
�


�

701 


cst312 711tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
 
@


�

711 

118 


cst313 712Conv2DBackpropFilter"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/8-InvertedResidual/conv-SequentialCell/2-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel@*
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�	:input�:filter_sizes**
dilation����*
kernel_size��*
group2
@
�


n

712 

710 713
make_tuple"3Default/network-TrainOneStepCell/optimizer-Momentum2


�

713 714AddN"3Default/network-TrainOneStepCell/optimizer-Momentum*	
n*
input_names �
:inputs*
output_names �:sum2
@
�


�

714 


cst314 715Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
@
�


�

features.10.conv.2.weight 
%
!moments.features.10.conv.2.weight 

222 

715 

momentum 716ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2
@
�


Z
	
cst67 

716 717depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

116 


cst315 718tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�

116 


cst316 719tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�

711 

features.10.conv.2.weight 


cst317 720Conv2DBackpropInput"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/8-InvertedResidual/conv-SequentialCell/2-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel@*
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�
:filter�:input_sizes**
dilation����*
kernel_size��*
group2
 
�


�

720 

117 721	ReLU6Grad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/10-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/2-ReLU6/gradReLU6*
output_names �
:output*&
input_names �
:y_grad�:x2
 
�


�

721 

115 
'
#features.10.conv.1.features.1.gamma 

719 

718 722FusedBatchNormGrad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/8-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm*8
output_names( �:dx�:bn_scale�:bn_bias*V
input_namesG �:dy�:x�	:scale�:	save_mean�:save_inv_variance*
epsilon-��'7*
momentum-���=2



�

722 


cst318 723tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

723 


cst319 724Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�
&
"features.10.conv.1.features.1.beta 
.
*moments.features.10.conv.1.features.1.beta 

222 

724 

momentum 725ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
Z
	
cst67 

725 726depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

722 


cst320 727tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

727 


cst321 728Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�
'
#features.10.conv.1.features.1.gamma 
/
+moments.features.10.conv.1.features.1.gamma 

222 

728 

momentum 729ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
Z
	
cst67 

729 730depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�
(
$features.10.conv.1.features.0.weight 


cst322 731Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2

�


�

722 


cst323 732tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
 
�


�

114 


cst324 

732 733#DepthwiseConv2dNativeBackpropFilter"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/10-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/0-DepthWiseConv/gradDepthwiseConv2dNative*
data_format:NCHW*&
pads����*(
stride����*:
input_names+ �	:input�:filter_size�:dout*
pad *
pad_mode:same*
channel_multiplier*
mode**
dilation����*
kernel_size��*
group*
output_names �
:output2

�


n

733 

731 734
make_tuple"3Default/network-TrainOneStepCell/optimizer-Momentum2


�

734 735AddN"3Default/network-TrainOneStepCell/optimizer-Momentum*	
n*
input_names �
:inputs*
output_names �:sum2

�


�

735 


cst325 736Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2

�


�
(
$features.10.conv.1.features.0.weight 
0
,moments.features.10.conv.1.features.0.weight 

222 

736 

momentum 737ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2

�


Z
	
cst67 

737 738depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

112 


cst326 739tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�

112 


cst327 740tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�


cst328 
(
$features.10.conv.1.features.0.weight 

732 741"DepthwiseConv2dNativeBackpropInput"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/10-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/0-DepthWiseConv/gradDepthwiseConv2dNative*
data_format:NCHW*&
pads����*(
stride����*:
input_names+ �:
input_size�
:filter�:dout*
pad *
pad_mode:same*
channel_multiplier*
mode**
dilation����*
kernel_size��*
group*
output_names �
:output2
 
�


�

741 

113 742	ReLU6Grad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/10-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/2-ReLU6/gradReLU6*
output_names �
:output*&
input_names �
:y_grad�:x2
 
�


�

742 

111 
'
#features.10.conv.0.features.1.gamma 

740 

739 743FusedBatchNormGrad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/8-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm*8
output_names( �:dx�:bn_scale�:bn_bias*V
input_namesG �:dy�:x�	:scale�:	save_mean�:save_inv_variance*
epsilon-��'7*
momentum-���=2



�

743 


cst329 744tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

744 


cst330 745Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�
&
"features.10.conv.0.features.1.beta 
.
*moments.features.10.conv.0.features.1.beta 

222 

745 

momentum 746ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
Z
	
cst67 

746 747depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

743 


cst331 748tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

748 


cst332 749Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�
'
#features.10.conv.0.features.1.gamma 
/
+moments.features.10.conv.0.features.1.gamma 

222 

749 

momentum 750ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
Z
	
cst67 

750 751depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�
(
$features.10.conv.0.features.0.weight 


cst333 752Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
�
@


�

743 


cst334 753tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
 
�


�

753 

110 


cst302 754Conv2DBackpropFilter"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/8-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/0-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel�*
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�	:input�:filter_sizes**
dilation����*
kernel_size��*
group2
�
@


n

754 

752 755
make_tuple"3Default/network-TrainOneStepCell/optimizer-Momentum2


�

755 756AddN"3Default/network-TrainOneStepCell/optimizer-Momentum*	
n*
input_names �
:inputs*
output_names �:sum2
�
@


�

756 


cst335 757Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
�
@


�
(
$features.10.conv.0.features.0.weight 
0
,moments.features.10.conv.0.features.0.weight 

222 

757 

momentum 758ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2
�
@


Z
	
cst67 

758 759depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

108 


cst336 760tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2
@
�

108 


cst337 761tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2
@
�

753 
(
$features.10.conv.0.features.0.weight 


cst306 762Conv2DBackpropInput"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/8-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/0-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel�*
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�
:filter�:input_sizes**
dilation����*
kernel_size��*
group2
 
@


�

762 

700 763
make_tuple"vDefault/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/8-InvertedResidual2


�

763 764AddN"vDefault/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/8-InvertedResidual*	
n*
input_names �
:inputs*
output_names �:sum2
 
@


�

764 

107 

features.9.conv.3.gamma 

761 

760 765FusedBatchNormGrad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/7-InvertedResidual/conv-SequentialCell/3-BatchNorm2d/gradFusedBatchNorm*8
output_names( �:dx�:bn_scale�:bn_bias*V
input_namesG �:dy�:x�	:scale�:	save_mean�:save_inv_variance*
epsilon-��'7*
momentum-���=2



�

765 


cst338 766tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
@
�

766 


cst339 767Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
@
�

features.9.conv.3.beta 
"
moments.features.9.conv.3.beta 

222 

767 

momentum 768ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2
@
Z
	
cst67 

768 769depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

765 


cst340 770tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
@
�

770 


cst341 771Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
@
�

features.9.conv.3.gamma 
#
moments.features.9.conv.3.gamma 

222 

771 

momentum 772ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2
@
Z
	
cst67 

772 773depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

features.9.conv.2.weight 


cst342 774Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
@
�


�

765 


cst343 775tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
 
@


�

775 

106 


cst313 776Conv2DBackpropFilter"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/8-InvertedResidual/conv-SequentialCell/2-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel@*
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�	:input�:filter_sizes**
dilation����*
kernel_size��*
group2
@
�


n

776 

774 777
make_tuple"3Default/network-TrainOneStepCell/optimizer-Momentum2


�

777 778AddN"3Default/network-TrainOneStepCell/optimizer-Momentum*	
n*
input_names �
:inputs*
output_names �:sum2
@
�


�

778 


cst344 779Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
@
�


�

features.9.conv.2.weight 
$
 moments.features.9.conv.2.weight 

222 

779 

momentum 780ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2
@
�


Z
	
cst67 

780 781depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

104 


cst345 782tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�

104 


cst346 783tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�

775 

features.9.conv.2.weight 


cst347 784Conv2DBackpropInput"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/8-InvertedResidual/conv-SequentialCell/2-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel@*
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�
:filter�:input_sizes**
dilation����*
kernel_size��*
group2
 
�


�

784 

105 785	ReLU6Grad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/9-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/2-ReLU6/gradReLU6*
output_names �
:output*&
input_names �
:y_grad�:x2
 
�


�

785 

103 
&
"features.9.conv.1.features.1.gamma 

783 

782 786FusedBatchNormGrad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/8-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm*8
output_names( �:dx�:bn_scale�:bn_bias*V
input_namesG �:dy�:x�	:scale�:	save_mean�:save_inv_variance*
epsilon-��'7*
momentum-���=2



�

786 


cst348 787tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

787 


cst349 788Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�
%
!features.9.conv.1.features.1.beta 
-
)moments.features.9.conv.1.features.1.beta 

222 

788 

momentum 789ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
Z
	
cst67 

789 790depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

786 


cst350 791tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

791 


cst351 792Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�
&
"features.9.conv.1.features.1.gamma 
.
*moments.features.9.conv.1.features.1.gamma 

222 

792 

momentum 793ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
Z
	
cst67 

793 794depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�
'
#features.9.conv.1.features.0.weight 


cst352 795Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2

�


�

786 


cst353 796tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
 
�


�

102 


cst354 

796 797#DepthwiseConv2dNativeBackpropFilter"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/9-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/0-DepthWiseConv/gradDepthwiseConv2dNative*
data_format:NCHW*&
pads����*(
stride����*:
input_names+ �	:input�:filter_size�:dout*
pad *
pad_mode:same*
channel_multiplier*
mode**
dilation����*
kernel_size��*
group*
output_names �
:output2

�


n

797 

795 798
make_tuple"3Default/network-TrainOneStepCell/optimizer-Momentum2


�

798 799AddN"3Default/network-TrainOneStepCell/optimizer-Momentum*	
n*
input_names �
:inputs*
output_names �:sum2

�


�

799 


cst355 800Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2

�


�
'
#features.9.conv.1.features.0.weight 
/
+moments.features.9.conv.1.features.0.weight 

222 

800 

momentum 801ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2

�


Z
	
cst67 

801 802depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

100 


cst356 803tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�

100 


cst357 804tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�


cst358 
'
#features.9.conv.1.features.0.weight 

796 805"DepthwiseConv2dNativeBackpropInput"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/9-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/0-DepthWiseConv/gradDepthwiseConv2dNative*
data_format:NCHW*&
pads����*(
stride����*:
input_names+ �:
input_size�
:filter�:dout*
pad *
pad_mode:same*
channel_multiplier*
mode**
dilation����*
kernel_size��*
group*
output_names �
:output2
 
�


�

805 

101 806	ReLU6Grad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/9-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/2-ReLU6/gradReLU6*
output_names �
:output*&
input_names �
:y_grad�:x2
 
�


�

806 

99 
&
"features.9.conv.0.features.1.gamma 

804 

803 807FusedBatchNormGrad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/8-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm*8
output_names( �:dx�:bn_scale�:bn_bias*V
input_namesG �:dy�:x�	:scale�:	save_mean�:save_inv_variance*
epsilon-��'7*
momentum-���=2



�

807 


cst359 808tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

808 


cst360 809Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�
%
!features.9.conv.0.features.1.beta 
-
)moments.features.9.conv.0.features.1.beta 

222 

809 

momentum 810ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
Z
	
cst67 

810 811depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

807 


cst361 812tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

812 


cst362 813Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�
&
"features.9.conv.0.features.1.gamma 
.
*moments.features.9.conv.0.features.1.gamma 

222 

813 

momentum 814ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
Z
	
cst67 

814 815depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�
'
#features.9.conv.0.features.0.weight 


cst363 816Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
�
@


�

807 


cst364 817tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
 
�


�

817 

98 


cst302 818Conv2DBackpropFilter"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/8-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/0-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel�*
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�	:input�:filter_sizes**
dilation����*
kernel_size��*
group2
�
@


n

818 

816 819
make_tuple"3Default/network-TrainOneStepCell/optimizer-Momentum2


�

819 820AddN"3Default/network-TrainOneStepCell/optimizer-Momentum*	
n*
input_names �
:inputs*
output_names �:sum2
�
@


�

820 


cst365 821Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
�
@


�
'
#features.9.conv.0.features.0.weight 
/
+moments.features.9.conv.0.features.0.weight 

222 

821 

momentum 822ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2
�
@


Z
	
cst67 

822 823depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

96 


cst366 824tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2
@
�

96 


cst367 825tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2
@
�

817 
'
#features.9.conv.0.features.0.weight 


cst306 826Conv2DBackpropInput"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/8-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/0-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel�*
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�
:filter�:input_sizes**
dilation����*
kernel_size��*
group2
 
@


�

826 

764 827
make_tuple"vDefault/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/8-InvertedResidual2


�

827 828AddN"vDefault/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/8-InvertedResidual*	
n*
input_names �
:inputs*
output_names �:sum2
 
@


�

828 

95 

features.8.conv.3.gamma 

825 

824 829FusedBatchNormGrad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/7-InvertedResidual/conv-SequentialCell/3-BatchNorm2d/gradFusedBatchNorm*8
output_names( �:dx�:bn_scale�:bn_bias*V
input_namesG �:dy�:x�	:scale�:	save_mean�:save_inv_variance*
epsilon-��'7*
momentum-���=2



�

829 


cst368 830tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
@
�

830 


cst369 831Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
@
�

features.8.conv.3.beta 
"
moments.features.8.conv.3.beta 

222 

831 

momentum 832ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2
@
Z
	
cst67 

832 833depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

829 


cst370 834tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
@
�

834 


cst371 835Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
@
�

features.8.conv.3.gamma 
#
moments.features.8.conv.3.gamma 

222 

835 

momentum 836ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2
@
Z
	
cst67 

836 837depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

features.8.conv.2.weight 


cst372 838Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
@
�


�

829 


cst373 839tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
 
@


�

839 

94 


cst313 840Conv2DBackpropFilter"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/8-InvertedResidual/conv-SequentialCell/2-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel@*
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�	:input�:filter_sizes**
dilation����*
kernel_size��*
group2
@
�


n

840 

838 841
make_tuple"3Default/network-TrainOneStepCell/optimizer-Momentum2


�

841 842AddN"3Default/network-TrainOneStepCell/optimizer-Momentum*	
n*
input_names �
:inputs*
output_names �:sum2
@
�


�

842 


cst374 843Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
@
�


�

features.8.conv.2.weight 
$
 moments.features.8.conv.2.weight 

222 

843 

momentum 844ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2
@
�


Z
	
cst67 

844 845depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

92 


cst375 846tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�

92 


cst376 847tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�

839 

features.8.conv.2.weight 


cst377 848Conv2DBackpropInput"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/8-InvertedResidual/conv-SequentialCell/2-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel@*
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�
:filter�:input_sizes**
dilation����*
kernel_size��*
group2
 
�


�

848 

93 849	ReLU6Grad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/8-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/2-ReLU6/gradReLU6*
output_names �
:output*&
input_names �
:y_grad�:x2
 
�


�

849 

91 
&
"features.8.conv.1.features.1.gamma 

847 

846 850FusedBatchNormGrad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/8-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm*8
output_names( �:dx�:bn_scale�:bn_bias*V
input_namesG �:dy�:x�	:scale�:	save_mean�:save_inv_variance*
epsilon-��'7*
momentum-���=2



�

850 


cst378 851tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

851 


cst379 852Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�
%
!features.8.conv.1.features.1.beta 
-
)moments.features.8.conv.1.features.1.beta 

222 

852 

momentum 853ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
Z
	
cst67 

853 854depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

850 


cst380 855tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

855 


cst381 856Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�
&
"features.8.conv.1.features.1.gamma 
.
*moments.features.8.conv.1.features.1.gamma 

222 

856 

momentum 857ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
Z
	
cst67 

857 858depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�
'
#features.8.conv.1.features.0.weight 


cst382 859Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2

�


�

850 


cst383 860tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
 
�


�

90 


cst384 

860 861#DepthwiseConv2dNativeBackpropFilter"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/8-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/0-DepthWiseConv/gradDepthwiseConv2dNative*
data_format:NCHW*&
pads����*(
stride����*:
input_names+ �	:input�:filter_size�:dout*
pad *
pad_mode:same*
channel_multiplier*
mode**
dilation����*
kernel_size��*
group*
output_names �
:output2

�


n

861 

859 862
make_tuple"3Default/network-TrainOneStepCell/optimizer-Momentum2


�

862 863AddN"3Default/network-TrainOneStepCell/optimizer-Momentum*	
n*
input_names �
:inputs*
output_names �:sum2

�


�

863 


cst385 864Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2

�


�
'
#features.8.conv.1.features.0.weight 
/
+moments.features.8.conv.1.features.0.weight 

222 

864 

momentum 865ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2

�


Z
	
cst67 

865 866depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

88 


cst386 867tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�

88 


cst387 868tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�


cst388 
'
#features.8.conv.1.features.0.weight 

860 869"DepthwiseConv2dNativeBackpropInput"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/8-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/0-DepthWiseConv/gradDepthwiseConv2dNative*
data_format:NCHW*&
pads����*(
stride����*:
input_names+ �:
input_size�
:filter�:dout*
pad *
pad_mode:same*
channel_multiplier*
mode**
dilation����*
kernel_size��*
group*
output_names �
:output2
 
�


�

869 

89 870	ReLU6Grad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/8-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/2-ReLU6/gradReLU6*
output_names �
:output*&
input_names �
:y_grad�:x2
 
�


�

870 

87 
&
"features.8.conv.0.features.1.gamma 

868 

867 871FusedBatchNormGrad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/8-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm*8
output_names( �:dx�:bn_scale�:bn_bias*V
input_namesG �:dy�:x�	:scale�:	save_mean�:save_inv_variance*
epsilon-��'7*
momentum-���=2



�

871 


cst389 872tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

872 


cst390 873Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�
%
!features.8.conv.0.features.1.beta 
-
)moments.features.8.conv.0.features.1.beta 

222 

873 

momentum 874ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
Z
	
cst67 

874 875depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

871 


cst391 876tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

876 


cst392 877Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�
&
"features.8.conv.0.features.1.gamma 
.
*moments.features.8.conv.0.features.1.gamma 

222 

877 

momentum 878ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
Z
	
cst67 

878 879depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�
'
#features.8.conv.0.features.0.weight 


cst393 880Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
�
@


�

871 


cst394 881tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
 
�


�

881 

86 


cst302 882Conv2DBackpropFilter"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/8-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/0-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel�*
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�	:input�:filter_sizes**
dilation����*
kernel_size��*
group2
�
@


n

882 

880 883
make_tuple"3Default/network-TrainOneStepCell/optimizer-Momentum2


�

883 884AddN"3Default/network-TrainOneStepCell/optimizer-Momentum*	
n*
input_names �
:inputs*
output_names �:sum2
�
@


�

884 


cst395 885Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
�
@


�
'
#features.8.conv.0.features.0.weight 
/
+moments.features.8.conv.0.features.0.weight 

222 

885 

momentum 886ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2
�
@


Z
	
cst67 

886 887depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

85 


cst396 888tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2
@
�

85 


cst397 889tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2
@
�

881 
'
#features.8.conv.0.features.0.weight 


cst306 890Conv2DBackpropInput"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/8-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/0-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel�*
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�
:filter�:input_sizes**
dilation����*
kernel_size��*
group2
 
@


�

890 

828 891
make_tuple"vDefault/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/8-InvertedResidual2


�

891 892AddN"vDefault/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/8-InvertedResidual*	
n*
input_names �
:inputs*
output_names �:sum2
 
@


�

892 

84 

features.7.conv.3.gamma 

889 

888 893FusedBatchNormGrad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/7-InvertedResidual/conv-SequentialCell/3-BatchNorm2d/gradFusedBatchNorm*8
output_names( �:dx�:bn_scale�:bn_bias*V
input_namesG �:dy�:x�	:scale�:	save_mean�:save_inv_variance*
epsilon-��'7*
momentum-���=2



�

893 


cst398 894tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
@
�

894 


cst399 895Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
@
�

features.7.conv.3.beta 
"
moments.features.7.conv.3.beta 

222 

895 

momentum 896ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2
@
Z
	
cst67 

896 897depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

893 


cst400 898tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
@
�

898 


cst401 899Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
@
�

features.7.conv.3.gamma 
#
moments.features.7.conv.3.gamma 

222 

899 

momentum 900ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2
@
Z
	
cst67 

900 901depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

features.7.conv.2.weight 


cst402 902Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
@
�


�

893 


cst403 903tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
 
@


�

903 

83 


cst404 904Conv2DBackpropFilter"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/7-InvertedResidual/conv-SequentialCell/2-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel@*
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�	:input�:filter_sizes**
dilation����*
kernel_size��*
group2
@
�


n

904 

902 905
make_tuple"3Default/network-TrainOneStepCell/optimizer-Momentum2


�

905 906AddN"3Default/network-TrainOneStepCell/optimizer-Momentum*	
n*
input_names �
:inputs*
output_names �:sum2
@
�


�

906 


cst405 907Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
@
�


�

features.7.conv.2.weight 
$
 moments.features.7.conv.2.weight 

222 

907 

momentum 908ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2
@
�


Z
	
cst67 

908 909depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

81 


cst406 910tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�

81 


cst407 911tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�

903 

features.7.conv.2.weight 


cst408 912Conv2DBackpropInput"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/7-InvertedResidual/conv-SequentialCell/2-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel@*
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�
:filter�:input_sizes**
dilation����*
kernel_size��*
group2
 
�


�

912 

82 913	ReLU6Grad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/7-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/2-ReLU6/gradReLU6*
output_names �
:output*&
input_names �
:y_grad�:x2
 
�


�

913 

80 
&
"features.7.conv.1.features.1.gamma 

911 

910 914FusedBatchNormGrad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/5-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm*8
output_names( �:dx�:bn_scale�:bn_bias*V
input_namesG �:dy�:x�	:scale�:	save_mean�:save_inv_variance*
epsilon-��'7*
momentum-���=2



�

914 


cst409 915tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

915 


cst410 916Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�
%
!features.7.conv.1.features.1.beta 
-
)moments.features.7.conv.1.features.1.beta 

222 

916 

momentum 917ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
Z
	
cst67 

917 918depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

914 


cst411 919tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

919 


cst412 920Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�
&
"features.7.conv.1.features.1.gamma 
.
*moments.features.7.conv.1.features.1.gamma 

222 

920 

momentum 921ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
Z
	
cst67 

921 922depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�
'
#features.7.conv.1.features.0.weight 


cst413 923Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2

�


�

914 


cst414 924tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
 
�


�

79 


cst415 

924 925#DepthwiseConv2dNativeBackpropFilter"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/7-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/0-DepthWiseConv/gradDepthwiseConv2dNative*
data_format:NCHW*&
pads� �� �*(
stride����*:
input_names+ �	:input�:filter_size�:dout*
pad *
pad_mode:same*
channel_multiplier*
mode**
dilation����*
kernel_size��*
group*
output_names �
:output2

�


n

925 

923 926
make_tuple"3Default/network-TrainOneStepCell/optimizer-Momentum2


�

926 927AddN"3Default/network-TrainOneStepCell/optimizer-Momentum*	
n*
input_names �
:inputs*
output_names �:sum2

�


�

927 


cst416 928Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2

�


�
'
#features.7.conv.1.features.0.weight 
/
+moments.features.7.conv.1.features.0.weight 

222 

928 

momentum 929ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2

�


Z
	
cst67 

929 930depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

77 


cst417 931tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�

77 


cst418 932tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�


cst419 
'
#features.7.conv.1.features.0.weight 

924 933"DepthwiseConv2dNativeBackpropInput"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/7-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/0-DepthWiseConv/gradDepthwiseConv2dNative*
data_format:NCHW*&
pads� �� �*(
stride����*:
input_names+ �:
input_size�
:filter�:dout*
pad *
pad_mode:same*
channel_multiplier*
mode**
dilation����*
kernel_size��*
group*
output_names �
:output2
 
�


�

933 

78 934	ReLU6Grad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/7-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/2-ReLU6/gradReLU6*
output_names �
:output*&
input_names �
:y_grad�:x2
 
�


�

934 

76 
&
"features.7.conv.0.features.1.gamma 

932 

931 935FusedBatchNormGrad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/5-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm*8
output_names( �:dx�:bn_scale�:bn_bias*V
input_namesG �:dy�:x�	:scale�:	save_mean�:save_inv_variance*
epsilon-��'7*
momentum-���=2



�

935 


cst420 936tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

936 


cst421 937Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�
%
!features.7.conv.0.features.1.beta 
-
)moments.features.7.conv.0.features.1.beta 

222 

937 

momentum 938ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
Z
	
cst67 

938 939depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

935 


cst422 940tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

940 


cst423 941Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�
&
"features.7.conv.0.features.1.gamma 
.
*moments.features.7.conv.0.features.1.gamma 

222 

941 

momentum 942ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
Z
	
cst67 

942 943depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�
'
#features.7.conv.0.features.0.weight 


cst424 944Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
�
 


�

935 


cst425 945tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
 
�


�

945 

75 


cst426 946Conv2DBackpropFilter"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/5-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/0-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel�*
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�	:input�:filter_sizes**
dilation����*
kernel_size��*
group2
�
 


n

946 

944 947
make_tuple"3Default/network-TrainOneStepCell/optimizer-Momentum2


�

947 948AddN"3Default/network-TrainOneStepCell/optimizer-Momentum*	
n*
input_names �
:inputs*
output_names �:sum2
�
 


�

948 


cst427 949Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
�
 


�
'
#features.7.conv.0.features.0.weight 
/
+moments.features.7.conv.0.features.0.weight 

222 

949 

momentum 950ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2
�
 


Z
	
cst67 

950 951depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

73 


cst428 952tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2
 
�

73 


cst429 953tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2
 
�

945 
'
#features.7.conv.0.features.0.weight 


cst430 954Conv2DBackpropInput"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/5-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/0-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel�*
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�
:filter�:input_sizes**
dilation����*
kernel_size��*
group2
 
 


�

954 

72 

features.6.conv.3.gamma 

953 

952 955FusedBatchNormGrad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm*8
output_names( �:dx�:bn_scale�:bn_bias*V
input_namesG �:dy�:x�	:scale�:	save_mean�:save_inv_variance*
epsilon-��'7*
momentum-���=2



�

955 


cst431 956tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
 
�

956 


cst432 957Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
 
�

features.6.conv.3.beta 
"
moments.features.6.conv.3.beta 

222 

957 

momentum 958ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2
 
Z
	
cst67 

958 959depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

955 


cst433 960tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
 
�

960 


cst434 961Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
 
�

features.6.conv.3.gamma 
#
moments.features.6.conv.3.gamma 

222 

961 

momentum 962ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2
 
Z
	
cst67 

962 963depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

features.6.conv.2.weight 


cst435 964Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
 
�


�

955 


cst436 965tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
 
 


�

965 

71 


cst437 966Conv2DBackpropFilter"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/5-InvertedResidual/conv-SequentialCell/2-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel *
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�	:input�:filter_sizes**
dilation����*
kernel_size��*
group2
 
�


n

966 

964 967
make_tuple"3Default/network-TrainOneStepCell/optimizer-Momentum2


�

967 968AddN"3Default/network-TrainOneStepCell/optimizer-Momentum*	
n*
input_names �
:inputs*
output_names �:sum2
 
�


�

968 


cst438 969Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
 
�


�

features.6.conv.2.weight 
$
 moments.features.6.conv.2.weight 

222 

969 

momentum 970ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2
 
�


Z
	
cst67 

970 971depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

69 


cst439 972tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�

69 


cst440 973tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�

965 

features.6.conv.2.weight 


cst441 974Conv2DBackpropInput"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/5-InvertedResidual/conv-SequentialCell/2-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel *
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�
:filter�:input_sizes**
dilation����*
kernel_size��*
group2
 
�


�

974 

70 975	ReLU6Grad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/6-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/2-ReLU6/gradReLU6*
output_names �
:output*&
input_names �
:y_grad�:x2
 
�


�

975 

68 
&
"features.6.conv.1.features.1.gamma 

973 

972 976FusedBatchNormGrad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/5-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm*8
output_names( �:dx�:bn_scale�:bn_bias*V
input_namesG �:dy�:x�	:scale�:	save_mean�:save_inv_variance*
epsilon-��'7*
momentum-���=2



�

976 


cst442 977tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

977 


cst443 978Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�
%
!features.6.conv.1.features.1.beta 
-
)moments.features.6.conv.1.features.1.beta 

222 

978 

momentum 979ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
Z
	
cst67 

979 980depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

976 


cst444 981tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

981 


cst445 982Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�
&
"features.6.conv.1.features.1.gamma 
.
*moments.features.6.conv.1.features.1.gamma 

222 

982 

momentum 983ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
Z
	
cst67 

983 984depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�
'
#features.6.conv.1.features.0.weight 


cst446 985Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2

�


�

976 


cst447 986tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
 
�


�

67 


cst448 

986 987#DepthwiseConv2dNativeBackpropFilter"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/6-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/0-DepthWiseConv/gradDepthwiseConv2dNative*
data_format:NCHW*&
pads����*(
stride����*:
input_names+ �	:input�:filter_size�:dout*
pad *
pad_mode:same*
channel_multiplier*
mode**
dilation����*
kernel_size��*
group*
output_names �
:output2

�


n

987 

985 988
make_tuple"3Default/network-TrainOneStepCell/optimizer-Momentum2


�

988 989AddN"3Default/network-TrainOneStepCell/optimizer-Momentum*	
n*
input_names �
:inputs*
output_names �:sum2

�


�

989 


cst449 990Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2

�


�
'
#features.6.conv.1.features.0.weight 
/
+moments.features.6.conv.1.features.0.weight 

222 

990 

momentum 991ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2

�


Z
	
cst67 

991 992depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

65 


cst450 993tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�

65 


cst451 994tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�


cst452 
'
#features.6.conv.1.features.0.weight 

986 995"DepthwiseConv2dNativeBackpropInput"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/6-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/0-DepthWiseConv/gradDepthwiseConv2dNative*
data_format:NCHW*&
pads����*(
stride����*:
input_names+ �:
input_size�
:filter�:dout*
pad *
pad_mode:same*
channel_multiplier*
mode**
dilation����*
kernel_size��*
group*
output_names �
:output2
 
�


�

995 

66 996	ReLU6Grad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/6-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/2-ReLU6/gradReLU6*
output_names �
:output*&
input_names �
:y_grad�:x2
 
�


�

996 

64 
&
"features.6.conv.0.features.1.gamma 

994 

993 997FusedBatchNormGrad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/5-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm*8
output_names( �:dx�:bn_scale�:bn_bias*V
input_namesG �:dy�:x�	:scale�:	save_mean�:save_inv_variance*
epsilon-��'7*
momentum-���=2



�

997 


cst453 998tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

998 


cst454 999Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�
%
!features.6.conv.0.features.1.beta 
-
)moments.features.6.conv.0.features.1.beta 

222 

999 

momentum 1000ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
\
	
cst67 

1000 1001depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

997 


cst455 1002tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

1002 


cst456 1003Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�
&
"features.6.conv.0.features.1.gamma 
.
*moments.features.6.conv.0.features.1.gamma 

222 

1003 

momentum 1004ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
\
	
cst67 

1004 1005depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�
'
#features.6.conv.0.features.0.weight 


cst457 1006Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
�
 


�

997 


cst458 1007tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
 
�


�

1007 

63 


cst426 1008Conv2DBackpropFilter"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/5-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/0-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel�*
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�	:input�:filter_sizes**
dilation����*
kernel_size��*
group2
�
 


q

1008 

1006 1009
make_tuple"3Default/network-TrainOneStepCell/optimizer-Momentum2


�

1009 1010AddN"3Default/network-TrainOneStepCell/optimizer-Momentum*	
n*
input_names �
:inputs*
output_names �:sum2
�
 


�

1010 


cst459 1011Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
�
 


�
'
#features.6.conv.0.features.0.weight 
/
+moments.features.6.conv.0.features.0.weight 

222 

1011 

momentum 1012ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2
�
 


\
	
cst67 

1012 1013depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

61 


cst460 1014tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2
 
�

61 


cst461 1015tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2
 
�

1007 
'
#features.6.conv.0.features.0.weight 


cst430 1016Conv2DBackpropInput"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/5-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/0-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel�*
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�
:filter�:input_sizes**
dilation����*
kernel_size��*
group2
 
 


�

1016 

954 1017
make_tuple"vDefault/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/5-InvertedResidual2


�

1017 1018AddN"vDefault/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/5-InvertedResidual*	
n*
input_names �
:inputs*
output_names �:sum2
 
 


�

1018 

60 

features.5.conv.3.gamma 

1015 

1014 1019FusedBatchNormGrad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm*8
output_names( �:dx�:bn_scale�:bn_bias*V
input_namesG �:dy�:x�	:scale�:	save_mean�:save_inv_variance*
epsilon-��'7*
momentum-���=2



�

1019 


cst462 1020tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
 
�

1020 


cst463 1021Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
 
�

features.5.conv.3.beta 
"
moments.features.5.conv.3.beta 

222 

1021 

momentum 1022ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2
 
\
	
cst67 

1022 1023depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

1019 


cst464 1024tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
 
�

1024 


cst465 1025Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
 
�

features.5.conv.3.gamma 
#
moments.features.5.conv.3.gamma 

222 

1025 

momentum 1026ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2
 
\
	
cst67 

1026 1027depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

features.5.conv.2.weight 


cst466 1028Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
 
�


�

1019 


cst467 1029tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
 
 


�

1029 

59 


cst437 1030Conv2DBackpropFilter"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/5-InvertedResidual/conv-SequentialCell/2-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel *
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�	:input�:filter_sizes**
dilation����*
kernel_size��*
group2
 
�


q

1030 

1028 1031
make_tuple"3Default/network-TrainOneStepCell/optimizer-Momentum2


�

1031 1032AddN"3Default/network-TrainOneStepCell/optimizer-Momentum*	
n*
input_names �
:inputs*
output_names �:sum2
 
�


�

1032 


cst468 1033Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
 
�


�

features.5.conv.2.weight 
$
 moments.features.5.conv.2.weight 

222 

1033 

momentum 1034ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2
 
�


\
	
cst67 

1034 1035depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

57 


cst469 1036tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�

57 


cst470 1037tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�

1029 

features.5.conv.2.weight 


cst471 1038Conv2DBackpropInput"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/5-InvertedResidual/conv-SequentialCell/2-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel *
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�
:filter�:input_sizes**
dilation����*
kernel_size��*
group2
 
�


�

1038 

58 1039	ReLU6Grad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/5-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/2-ReLU6/gradReLU6*
output_names �
:output*&
input_names �
:y_grad�:x2
 
�


�

1039 

56 
&
"features.5.conv.1.features.1.gamma 

1037 

1036 1040FusedBatchNormGrad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/5-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm*8
output_names( �:dx�:bn_scale�:bn_bias*V
input_namesG �:dy�:x�	:scale�:	save_mean�:save_inv_variance*
epsilon-��'7*
momentum-���=2



�

1040 


cst472 1041tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

1041 


cst473 1042Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�
%
!features.5.conv.1.features.1.beta 
-
)moments.features.5.conv.1.features.1.beta 

222 

1042 

momentum 1043ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
\
	
cst67 

1043 1044depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

1040 


cst474 1045tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

1045 


cst475 1046Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�
&
"features.5.conv.1.features.1.gamma 
.
*moments.features.5.conv.1.features.1.gamma 

222 

1046 

momentum 1047ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
\
	
cst67 

1047 1048depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�
'
#features.5.conv.1.features.0.weight 


cst476 1049Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2

�


�

1040 


cst477 1050tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
 
�


�

55 


cst478 

1050 1051#DepthwiseConv2dNativeBackpropFilter"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/5-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/0-DepthWiseConv/gradDepthwiseConv2dNative*
data_format:NCHW*&
pads����*(
stride����*:
input_names+ �	:input�:filter_size�:dout*
pad *
pad_mode:same*
channel_multiplier*
mode**
dilation����*
kernel_size��*
group*
output_names �
:output2

�


q

1051 

1049 1052
make_tuple"3Default/network-TrainOneStepCell/optimizer-Momentum2


�

1052 1053AddN"3Default/network-TrainOneStepCell/optimizer-Momentum*	
n*
input_names �
:inputs*
output_names �:sum2

�


�

1053 


cst479 1054Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2

�


�
'
#features.5.conv.1.features.0.weight 
/
+moments.features.5.conv.1.features.0.weight 

222 

1054 

momentum 1055ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2

�


\
	
cst67 

1055 1056depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

53 


cst480 1057tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�

53 


cst481 1058tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�


cst482 
'
#features.5.conv.1.features.0.weight 

1050 1059"DepthwiseConv2dNativeBackpropInput"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/5-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/0-DepthWiseConv/gradDepthwiseConv2dNative*
data_format:NCHW*&
pads����*(
stride����*:
input_names+ �:
input_size�
:filter�:dout*
pad *
pad_mode:same*
channel_multiplier*
mode**
dilation����*
kernel_size��*
group*
output_names �
:output2
 
�


�

1059 

54 1060	ReLU6Grad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/5-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/2-ReLU6/gradReLU6*
output_names �
:output*&
input_names �
:y_grad�:x2
 
�


�

1060 

52 
&
"features.5.conv.0.features.1.gamma 

1058 

1057 1061FusedBatchNormGrad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/5-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm*8
output_names( �:dx�:bn_scale�:bn_bias*V
input_namesG �:dy�:x�	:scale�:	save_mean�:save_inv_variance*
epsilon-��'7*
momentum-���=2



�

1061 


cst483 1062tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

1062 


cst484 1063Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�
%
!features.5.conv.0.features.1.beta 
-
)moments.features.5.conv.0.features.1.beta 

222 

1063 

momentum 1064ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
\
	
cst67 

1064 1065depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

1061 


cst485 1066tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

1066 


cst486 1067Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�
&
"features.5.conv.0.features.1.gamma 
.
*moments.features.5.conv.0.features.1.gamma 

222 

1067 

momentum 1068ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
\
	
cst67 

1068 1069depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�
'
#features.5.conv.0.features.0.weight 


cst487 1070Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
�
 


�

1061 


cst488 1071tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
 
�


�

1071 

51 


cst426 1072Conv2DBackpropFilter"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/5-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/0-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel�*
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�	:input�:filter_sizes**
dilation����*
kernel_size��*
group2
�
 


q

1072 

1070 1073
make_tuple"3Default/network-TrainOneStepCell/optimizer-Momentum2


�

1073 1074AddN"3Default/network-TrainOneStepCell/optimizer-Momentum*	
n*
input_names �
:inputs*
output_names �:sum2
�
 


�

1074 


cst489 1075Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
�
 


�
'
#features.5.conv.0.features.0.weight 
/
+moments.features.5.conv.0.features.0.weight 

222 

1075 

momentum 1076ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2
�
 


\
	
cst67 

1076 1077depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

50 


cst490 1078tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2
 
�

50 


cst491 1079tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2
 
�

1071 
'
#features.5.conv.0.features.0.weight 


cst430 1080Conv2DBackpropInput"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/5-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/0-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel�*
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�
:filter�:input_sizes**
dilation����*
kernel_size��*
group2
 
 


�

1080 

1018 1081
make_tuple"vDefault/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/5-InvertedResidual2


�

1081 1082AddN"vDefault/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/5-InvertedResidual*	
n*
input_names �
:inputs*
output_names �:sum2
 
 


�

1082 

49 

features.4.conv.3.gamma 

1079 

1078 1083FusedBatchNormGrad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm*8
output_names( �:dx�:bn_scale�:bn_bias*V
input_namesG �:dy�:x�	:scale�:	save_mean�:save_inv_variance*
epsilon-��'7*
momentum-���=2



�

1083 


cst492 1084tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
 
�

1084 


cst493 1085Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
 
�

features.4.conv.3.beta 
"
moments.features.4.conv.3.beta 

222 

1085 

momentum 1086ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2
 
\
	
cst67 

1086 1087depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

1083 


cst494 1088tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
 
�

1088 


cst495 1089Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
 
�

features.4.conv.3.gamma 
#
moments.features.4.conv.3.gamma 

222 

1089 

momentum 1090ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2
 
\
	
cst67 

1090 1091depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

features.4.conv.2.weight 


cst496 1092Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
 
�


�

1083 


cst497 1093tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
 
 


�

1093 

48 


cst498 1094Conv2DBackpropFilter"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/4-InvertedResidual/conv-SequentialCell/2-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel *
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�	:input�:filter_sizes**
dilation����*
kernel_size��*
group2
 
�


q

1094 

1092 1095
make_tuple"3Default/network-TrainOneStepCell/optimizer-Momentum2


�

1095 1096AddN"3Default/network-TrainOneStepCell/optimizer-Momentum*	
n*
input_names �
:inputs*
output_names �:sum2
 
�


�

1096 


cst499 1097Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
 
�


�

features.4.conv.2.weight 
$
 moments.features.4.conv.2.weight 

222 

1097 

momentum 1098ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2
 
�


\
	
cst67 

1098 1099depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

46 


cst500 1100tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�

46 


cst501 1101tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�

1093 

features.4.conv.2.weight 


cst502 1102Conv2DBackpropInput"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/4-InvertedResidual/conv-SequentialCell/2-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel *
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�
:filter�:input_sizes**
dilation����*
kernel_size��*
group2
 
�


�

1102 

47 1103	ReLU6Grad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/4-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/2-ReLU6/gradReLU6*
output_names �
:output*&
input_names �
:y_grad�:x2
 
�


�

1103 

45 
&
"features.4.conv.1.features.1.gamma 

1101 

1100 1104FusedBatchNormGrad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/3-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm*8
output_names( �:dx�:bn_scale�:bn_bias*V
input_namesG �:dy�:x�	:scale�:	save_mean�:save_inv_variance*
epsilon-��'7*
momentum-���=2



�

1104 


cst503 1105tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

1105 


cst504 1106Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�
%
!features.4.conv.1.features.1.beta 
-
)moments.features.4.conv.1.features.1.beta 

222 

1106 

momentum 1107ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
\
	
cst67 

1107 1108depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

1104 


cst505 1109tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

1109 


cst506 1110Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�
&
"features.4.conv.1.features.1.gamma 
.
*moments.features.4.conv.1.features.1.gamma 

222 

1110 

momentum 1111ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
\
	
cst67 

1111 1112depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�
'
#features.4.conv.1.features.0.weight 


cst507 1113Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2

�


�

1104 


cst508 1114tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
 
�


�

44 


cst509 

1114 1115#DepthwiseConv2dNativeBackpropFilter"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/4-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/0-DepthWiseConv/gradDepthwiseConv2dNative*
data_format:NCHW*&
pads� �� �*(
stride����*:
input_names+ �	:input�:filter_size�:dout*
pad *
pad_mode:same*
channel_multiplier*
mode**
dilation����*
kernel_size��*
group*
output_names �
:output2

�


q

1115 

1113 1116
make_tuple"3Default/network-TrainOneStepCell/optimizer-Momentum2


�

1116 1117AddN"3Default/network-TrainOneStepCell/optimizer-Momentum*	
n*
input_names �
:inputs*
output_names �:sum2

�


�

1117 


cst510 1118Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2

�


�
'
#features.4.conv.1.features.0.weight 
/
+moments.features.4.conv.1.features.0.weight 

222 

1118 

momentum 1119ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2

�


\
	
cst67 

1119 1120depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

42 


cst511 1121tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�

42 


cst512 1122tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�


cst513 
'
#features.4.conv.1.features.0.weight 

1114 1123"DepthwiseConv2dNativeBackpropInput"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/4-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/0-DepthWiseConv/gradDepthwiseConv2dNative*
data_format:NCHW*&
pads� �� �*(
stride����*:
input_names+ �:
input_size�
:filter�:dout*
pad *
pad_mode:same*
channel_multiplier*
mode**
dilation����*
kernel_size��*
group*
output_names �
:output2
 
�
8
8
�

1123 

43 1124	ReLU6Grad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/4-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/2-ReLU6/gradReLU6*
output_names �
:output*&
input_names �
:y_grad�:x2
 
�
8
8
�

1124 

41 
&
"features.4.conv.0.features.1.gamma 

1122 

1121 1125FusedBatchNormGrad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/3-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm*8
output_names( �:dx�:bn_scale�:bn_bias*V
input_namesG �:dy�:x�	:scale�:	save_mean�:save_inv_variance*
epsilon-��'7*
momentum-���=2



�

1125 


cst514 1126tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

1126 


cst515 1127Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�
%
!features.4.conv.0.features.1.beta 
-
)moments.features.4.conv.0.features.1.beta 

222 

1127 

momentum 1128ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
\
	
cst67 

1128 1129depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

1125 


cst516 1130tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

1130 


cst517 1131Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�
&
"features.4.conv.0.features.1.gamma 
.
*moments.features.4.conv.0.features.1.gamma 

222 

1131 

momentum 1132ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
\
	
cst67 

1132 1133depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�
'
#features.4.conv.0.features.0.weight 


cst518 1134Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
�



�

1125 


cst519 1135tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
 
�
8
8
�

1135 

40 


cst520 1136Conv2DBackpropFilter"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/3-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/0-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel�*
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�	:input�:filter_sizes**
dilation����*
kernel_size��*
group2
�



q

1136 

1134 1137
make_tuple"3Default/network-TrainOneStepCell/optimizer-Momentum2


�

1137 1138AddN"3Default/network-TrainOneStepCell/optimizer-Momentum*	
n*
input_names �
:inputs*
output_names �:sum2
�



�

1138 


cst521 1139Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
�



�
'
#features.4.conv.0.features.0.weight 
/
+moments.features.4.conv.0.features.0.weight 

222 

1139 

momentum 1140ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2
�



\
	
cst67 

1140 1141depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

38 


cst522 1142tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2

�

38 


cst523 1143tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2

�

1135 
'
#features.4.conv.0.features.0.weight 


cst524 1144Conv2DBackpropInput"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/3-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/0-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel�*
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�
:filter�:input_sizes**
dilation����*
kernel_size��*
group2
 

8
8
�

1144 

37 

features.3.conv.3.gamma 

1143 

1142 1145FusedBatchNormGrad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/2-InvertedResidual/conv-SequentialCell/3-BatchNorm2d/gradFusedBatchNorm*8
output_names( �:dx�:bn_scale�:bn_bias*V
input_namesG �:dy�:x�	:scale�:	save_mean�:save_inv_variance*
epsilon-��'7*
momentum-���=2



�

1145 


cst525 1146tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2

�

1146 


cst526 1147Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2

�

features.3.conv.3.beta 
"
moments.features.3.conv.3.beta 

222 

1147 

momentum 1148ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2

\
	
cst67 

1148 1149depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

1145 


cst527 1150tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2

�

1150 


cst528 1151Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2

�

features.3.conv.3.gamma 
#
moments.features.3.conv.3.gamma 

222 

1151 

momentum 1152ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2

\
	
cst67 

1152 1153depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

features.3.conv.2.weight 


cst529 1154Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2

�


�

1145 


cst530 1155tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
 

8
8
�

1155 

36 


cst531 1156Conv2DBackpropFilter"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/3-InvertedResidual/conv-SequentialCell/2-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel*
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�	:input�:filter_sizes**
dilation����*
kernel_size��*
group2

�


q

1156 

1154 1157
make_tuple"3Default/network-TrainOneStepCell/optimizer-Momentum2


�

1157 1158AddN"3Default/network-TrainOneStepCell/optimizer-Momentum*	
n*
input_names �
:inputs*
output_names �:sum2

�


�

1158 


cst532 1159Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2

�


�

features.3.conv.2.weight 
$
 moments.features.3.conv.2.weight 

222 

1159 

momentum 1160ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2

�


\
	
cst67 

1160 1161depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

34 


cst533 1162tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�

34 


cst534 1163tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�

1155 

features.3.conv.2.weight 


cst535 1164Conv2DBackpropInput"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/3-InvertedResidual/conv-SequentialCell/2-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel*
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�
:filter�:input_sizes**
dilation����*
kernel_size��*
group2
 
�
8
8
�

1164 

35 1165	ReLU6Grad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/3-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/2-ReLU6/gradReLU6*
output_names �
:output*&
input_names �
:y_grad�:x2
 
�
8
8
�

1165 

33 
&
"features.3.conv.1.features.1.gamma 

1163 

1162 1166FusedBatchNormGrad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/3-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm*8
output_names( �:dx�:bn_scale�:bn_bias*V
input_namesG �:dy�:x�	:scale�:	save_mean�:save_inv_variance*
epsilon-��'7*
momentum-���=2



�

1166 


cst536 1167tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

1167 


cst537 1168Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�
%
!features.3.conv.1.features.1.beta 
-
)moments.features.3.conv.1.features.1.beta 

222 

1168 

momentum 1169ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
\
	
cst67 

1169 1170depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

1166 


cst538 1171tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

1171 


cst539 1172Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�
&
"features.3.conv.1.features.1.gamma 
.
*moments.features.3.conv.1.features.1.gamma 

222 

1172 

momentum 1173ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
\
	
cst67 

1173 1174depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�
'
#features.3.conv.1.features.0.weight 


cst540 1175Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2

�


�

1166 


cst541 1176tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
 
�
8
8
�

32 


cst542 

1176 1177#DepthwiseConv2dNativeBackpropFilter"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/3-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/0-DepthWiseConv/gradDepthwiseConv2dNative*
data_format:NCHW*&
pads����*(
stride����*:
input_names+ �	:input�:filter_size�:dout*
pad *
pad_mode:same*
channel_multiplier*
mode**
dilation����*
kernel_size��*
group*
output_names �
:output2

�


q

1177 

1175 1178
make_tuple"3Default/network-TrainOneStepCell/optimizer-Momentum2


�

1178 1179AddN"3Default/network-TrainOneStepCell/optimizer-Momentum*	
n*
input_names �
:inputs*
output_names �:sum2

�


�

1179 


cst543 1180Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2

�


�
'
#features.3.conv.1.features.0.weight 
/
+moments.features.3.conv.1.features.0.weight 

222 

1180 

momentum 1181ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2

�


\
	
cst67 

1181 1182depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

30 


cst544 1183tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�

30 


cst545 1184tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2	
�
�


cst546 
'
#features.3.conv.1.features.0.weight 

1176 1185"DepthwiseConv2dNativeBackpropInput"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/3-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/0-DepthWiseConv/gradDepthwiseConv2dNative*
data_format:NCHW*&
pads����*(
stride����*:
input_names+ �:
input_size�
:filter�:dout*
pad *
pad_mode:same*
channel_multiplier*
mode**
dilation����*
kernel_size��*
group*
output_names �
:output2
 
�
8
8
�

1185 

31 1186	ReLU6Grad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/3-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/2-ReLU6/gradReLU6*
output_names �
:output*&
input_names �
:y_grad�:x2
 
�
8
8
�

1186 

29 
&
"features.3.conv.0.features.1.gamma 

1184 

1183 1187FusedBatchNormGrad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/3-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm*8
output_names( �:dx�:bn_scale�:bn_bias*V
input_namesG �:dy�:x�	:scale�:	save_mean�:save_inv_variance*
epsilon-��'7*
momentum-���=2



�

1187 


cst547 1188tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

1188 


cst548 1189Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�
%
!features.3.conv.0.features.1.beta 
-
)moments.features.3.conv.0.features.1.beta 

222 

1189 

momentum 1190ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
\
	
cst67 

1190 1191depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

1187 


cst549 1192tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2	
�
�

1192 


cst550 1193Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2	
�
�
&
"features.3.conv.0.features.1.gamma 
.
*moments.features.3.conv.0.features.1.gamma 

222 

1193 

momentum 1194ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2	
�
\
	
cst67 

1194 1195depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�
'
#features.3.conv.0.features.0.weight 


cst551 1196Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
�



�

1187 


cst552 1197tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
 
�
8
8
�

1197 

28 


cst520 1198Conv2DBackpropFilter"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/3-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/0-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel�*
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�	:input�:filter_sizes**
dilation����*
kernel_size��*
group2
�



q

1198 

1196 1199
make_tuple"3Default/network-TrainOneStepCell/optimizer-Momentum2


�

1199 1200AddN"3Default/network-TrainOneStepCell/optimizer-Momentum*	
n*
input_names �
:inputs*
output_names �:sum2
�



�

1200 


cst553 1201Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
�



�
'
#features.3.conv.0.features.0.weight 
/
+moments.features.3.conv.0.features.0.weight 

222 

1201 

momentum 1202ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2
�



\
	
cst67 

1202 1203depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

27 


cst554 1204tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2

�

27 


cst555 1205tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2

�

1197 
'
#features.3.conv.0.features.0.weight 


cst524 1206Conv2DBackpropInput"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/3-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/0-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel�*
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�
:filter�:input_sizes**
dilation����*
kernel_size��*
group2
 

8
8
�

1206 

1144 1207
make_tuple"vDefault/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/3-InvertedResidual2


�

1207 1208AddN"vDefault/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/3-InvertedResidual*	
n*
input_names �
:inputs*
output_names �:sum2
 

8
8
�

1208 

26 

features.2.conv.3.gamma 

1205 

1204 1209FusedBatchNormGrad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/2-InvertedResidual/conv-SequentialCell/3-BatchNorm2d/gradFusedBatchNorm*8
output_names( �:dx�:bn_scale�:bn_bias*V
input_namesG �:dy�:x�	:scale�:	save_mean�:save_inv_variance*
epsilon-��'7*
momentum-���=2



�

1209 


cst556 1210tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2

�

1210 


cst557 1211Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2

�

features.2.conv.3.beta 
"
moments.features.2.conv.3.beta 

222 

1211 

momentum 1212ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2

\
	
cst67 

1212 1213depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

1209 


cst558 1214tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2

�

1214 


cst559 1215Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2

�

features.2.conv.3.gamma 
#
moments.features.2.conv.3.gamma 

222 

1215 

momentum 1216ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2

\
	
cst67 

1216 1217depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

features.2.conv.2.weight 


cst560 1218Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2

`


�

1209 


cst561 1219tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
 

8
8
�

1219 

25 


cst562 1220Conv2DBackpropFilter"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/2-InvertedResidual/conv-SequentialCell/2-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel*
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�	:input�:filter_sizes**
dilation����*
kernel_size��*
group2

`


q

1220 

1218 1221
make_tuple"3Default/network-TrainOneStepCell/optimizer-Momentum2


�

1221 1222AddN"3Default/network-TrainOneStepCell/optimizer-Momentum*	
n*
input_names �
:inputs*
output_names �:sum2

`


�

1222 


cst563 1223Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2

`


�

features.2.conv.2.weight 
$
 moments.features.2.conv.2.weight 

222 

1223 

momentum 1224ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2

`


\
	
cst67 

1224 1225depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

23 


cst564 1226tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2
`
�

23 


cst565 1227tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2
`
�

1219 

features.2.conv.2.weight 


cst566 1228Conv2DBackpropInput"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/2-InvertedResidual/conv-SequentialCell/2-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel*
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�
:filter�:input_sizes**
dilation����*
kernel_size��*
group2
 
`
8
8
�

1228 

24 1229	ReLU6Grad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/2-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/2-ReLU6/gradReLU6*
output_names �
:output*&
input_names �
:y_grad�:x2
 
`
8
8
�

1229 

22 
&
"features.2.conv.1.features.1.gamma 

1227 

1226 1230FusedBatchNormGrad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/11-InvertedResidual/conv-SequentialCell/3-BatchNorm2d/gradFusedBatchNorm*8
output_names( �:dx�:bn_scale�:bn_bias*V
input_namesG �:dy�:x�	:scale�:	save_mean�:save_inv_variance*
epsilon-��'7*
momentum-���=2



�

1230 


cst567 1231tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
`
�

1231 


cst568 1232Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
`
�
%
!features.2.conv.1.features.1.beta 
-
)moments.features.2.conv.1.features.1.beta 

222 

1232 

momentum 1233ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2
`
\
	
cst67 

1233 1234depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

1230 


cst569 1235tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
`
�

1235 


cst570 1236Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
`
�
&
"features.2.conv.1.features.1.gamma 
.
*moments.features.2.conv.1.features.1.gamma 

222 

1236 

momentum 1237ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2
`
\
	
cst67 

1237 1238depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�
'
#features.2.conv.1.features.0.weight 


cst571 1239Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2

`


�

1230 


cst572 1240tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
 
`
8
8
�

21 


cst573 

1240 1241#DepthwiseConv2dNativeBackpropFilter"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/2-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/0-DepthWiseConv/gradDepthwiseConv2dNative*
data_format:NCHW*&
pads� �� �*(
stride����*:
input_names+ �	:input�:filter_size�:dout*
pad *
pad_mode:same*
channel_multiplier*
mode**
dilation����*
kernel_size��*
group*
output_names �
:output2

`


q

1241 

1239 1242
make_tuple"3Default/network-TrainOneStepCell/optimizer-Momentum2


�

1242 1243AddN"3Default/network-TrainOneStepCell/optimizer-Momentum*	
n*
input_names �
:inputs*
output_names �:sum2

`


�

1243 


cst574 1244Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2

`


�
'
#features.2.conv.1.features.0.weight 
/
+moments.features.2.conv.1.features.0.weight 

222 

1244 

momentum 1245ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2

`


\
	
cst67 

1245 1246depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

19 


cst575 1247tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2
`
�

19 


cst576 1248tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2
`
�


cst577 
'
#features.2.conv.1.features.0.weight 

1240 1249"DepthwiseConv2dNativeBackpropInput"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/2-InvertedResidual/conv-SequentialCell/1-ConvBNReLU/features-SequentialCell/0-DepthWiseConv/gradDepthwiseConv2dNative*
data_format:NCHW*&
pads� �� �*(
stride����*:
input_names+ �:
input_size�
:filter�:dout*
pad *
pad_mode:same*
channel_multiplier*
mode**
dilation����*
kernel_size��*
group*
output_names �
:output2
 
`
p
p
�

1249 

20 1250	ReLU6Grad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/2-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/2-ReLU6/gradReLU6*
output_names �
:output*&
input_names �
:y_grad�:x2
 
`
p
p
�

1250 

18 
&
"features.2.conv.0.features.1.gamma 

1248 

1247 1251FusedBatchNormGrad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/11-InvertedResidual/conv-SequentialCell/3-BatchNorm2d/gradFusedBatchNorm*8
output_names( �:dx�:bn_scale�:bn_bias*V
input_namesG �:dy�:x�	:scale�:	save_mean�:save_inv_variance*
epsilon-��'7*
momentum-���=2



�

1251 


cst578 1252tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
`
�

1252 


cst579 1253Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
`
�
%
!features.2.conv.0.features.1.beta 
-
)moments.features.2.conv.0.features.1.beta 

222 

1253 

momentum 1254ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2
`
\
	
cst67 

1254 1255depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

1251 


cst580 1256tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
`
�

1256 


cst581 1257Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
`
�
&
"features.2.conv.0.features.1.gamma 
.
*moments.features.2.conv.0.features.1.gamma 

222 

1257 

momentum 1258ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2
`
\
	
cst67 

1258 1259depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�
'
#features.2.conv.0.features.0.weight 


cst582 1260Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
`



�

1251 


cst583 1261tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
 
`
p
p
�

1261 

17 


cst584 1262Conv2DBackpropFilter"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/2-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/0-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel`*
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�	:input�:filter_sizes**
dilation����*
kernel_size��*
group2
`



q

1262 

1260 1263
make_tuple"3Default/network-TrainOneStepCell/optimizer-Momentum2


�

1263 1264AddN"3Default/network-TrainOneStepCell/optimizer-Momentum*	
n*
input_names �
:inputs*
output_names �:sum2
`



�

1264 


cst585 1265Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
`



�
'
#features.2.conv.0.features.0.weight 
/
+moments.features.2.conv.0.features.0.weight 

222 

1265 

momentum 1266ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2
`



\
	
cst67 

1266 1267depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

16 


cst586 1268tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2

�

16 


cst587 1269tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2

�

1261 
'
#features.2.conv.0.features.0.weight 


cst588 1270Conv2DBackpropInput"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/2-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/0-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel`*
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�
:filter�:input_sizes**
dilation����*
kernel_size��*
group2
 

p
p
�

1270 

15 

features.1.conv.2.gamma 

1269 

1268 1271FusedBatchNormGrad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/1-InvertedResidual/conv-SequentialCell/2-BatchNorm2d/gradFusedBatchNorm*8
output_names( �:dx�:bn_scale�:bn_bias*V
input_namesG �:dy�:x�	:scale�:	save_mean�:save_inv_variance*
epsilon-��'7*
momentum-���=2



�

1271 


cst589 1272tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2

�

1272 


cst590 1273Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2

�

features.1.conv.2.beta 
"
moments.features.1.conv.2.beta 

222 

1273 

momentum 1274ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2

\
	
cst67 

1274 1275depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

1271 


cst591 1276tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2

�

1276 


cst592 1277Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2

�

features.1.conv.2.gamma 
#
moments.features.1.conv.2.gamma 

222 

1277 

momentum 1278ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2

\
	
cst67 

1278 1279depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

features.1.conv.1.weight 


cst593 1280Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2

 


�

1271 


cst594 1281tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
 

p
p
�

1281 

14 


cst595 1282Conv2DBackpropFilter"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/1-InvertedResidual/conv-SequentialCell/1-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel*
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�	:input�:filter_sizes**
dilation����*
kernel_size��*
group2

 


q

1282 

1280 1283
make_tuple"3Default/network-TrainOneStepCell/optimizer-Momentum2


�

1283 1284AddN"3Default/network-TrainOneStepCell/optimizer-Momentum*	
n*
input_names �
:inputs*
output_names �:sum2

 


�

1284 


cst596 1285Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2

 


�

features.1.conv.1.weight 
$
 moments.features.1.conv.1.weight 

222 

1285 

momentum 1286ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2

 


\
	
cst67 

1286 1287depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

12 


cst597 1288tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2
 
�

12 


cst598 1289tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2
 
�

1281 

features.1.conv.1.weight 


cst599 1290Conv2DBackpropInput"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/1-InvertedResidual/conv-SequentialCell/1-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� � � � *
pad *
pad_mode:SAME*
out_channel*
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�
:filter�:input_sizes**
dilation����*
kernel_size��*
group2
 
 
p
p
�

1290 

13 1291	ReLU6Grad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/1-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/2-ReLU6/gradReLU6*
output_names �
:output*&
input_names �
:y_grad�:x2
 
 
p
p
�

1291 

11 
&
"features.1.conv.0.features.1.gamma 

1289 

1288 1292FusedBatchNormGrad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm*8
output_names( �:dx�:bn_scale�:bn_bias*V
input_namesG �:dy�:x�	:scale�:	save_mean�:save_inv_variance*
epsilon-��'7*
momentum-���=2



�

1292 


cst600 1293tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
 
�

1293 


cst601 1294Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
 
�
%
!features.1.conv.0.features.1.beta 
-
)moments.features.1.conv.0.features.1.beta 

222 

1294 

momentum 1295ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2
 
\
	
cst67 

1295 1296depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

1292 


cst602 1297tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
 
�

1297 


cst603 1298Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
 
�
&
"features.1.conv.0.features.1.gamma 
.
*moments.features.1.conv.0.features.1.gamma 

222 

1298 

momentum 1299ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2
 
\
	
cst67 

1299 1300depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�
'
#features.1.conv.0.features.0.weight 


cst604 1301Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2

 


�

1292 


cst605 1302tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
 
 
p
p
�

10 


cst606 

1302 1303#DepthwiseConv2dNativeBackpropFilter"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/1-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/0-DepthWiseConv/gradDepthwiseConv2dNative*
data_format:NCHW*&
pads����*(
stride����*:
input_names+ �	:input�:filter_size�:dout*
pad *
pad_mode:same*
channel_multiplier*
mode**
dilation����*
kernel_size��*
group*
output_names �
:output2

 


q

1303 

1301 1304
make_tuple"3Default/network-TrainOneStepCell/optimizer-Momentum2


�

1304 1305AddN"3Default/network-TrainOneStepCell/optimizer-Momentum*	
n*
input_names �
:inputs*
output_names �:sum2

 


�

1305 


cst607 1306Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2

 


�
'
#features.1.conv.0.features.0.weight 
/
+moments.features.1.conv.0.features.0.weight 

222 

1306 

momentum 1307ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2

 


\
	
cst67 

1307 1308depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

8 


cst608 1309tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2
 
�

8 


cst609 1310tuple_getitem"�Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d2
 
�


cst610 
'
#features.1.conv.0.features.0.weight 

1302 1311"DepthwiseConv2dNativeBackpropInput"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/1-InvertedResidual/conv-SequentialCell/0-ConvBNReLU/features-SequentialCell/0-DepthWiseConv/gradDepthwiseConv2dNative*
data_format:NCHW*&
pads����*(
stride����*:
input_names+ �:
input_size�
:filter�:dout*
pad *
pad_mode:same*
channel_multiplier*
mode**
dilation����*
kernel_size��*
group*
output_names �
:output2
 
 
p
p
�

1311 

9 1312	ReLU6Grad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/2-ReLU6/gradReLU6*
output_names �
:output*&
input_names �
:y_grad�:x2
 
 
p
p
�

1312 

7 

features.0.features.1.gamma 

1310 

1309 1313FusedBatchNormGrad"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm*8
output_names( �:dx�:bn_scale�:bn_bias*V
input_namesG �:dy�:x�	:scale�:	save_mean�:save_inv_variance*
epsilon-��'7*
momentum-���=2



�

1313 


cst611 1314tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
 
�

1314 


cst612 1315Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
 
�

features.0.features.1.beta 
&
"moments.features.0.features.1.beta 

222 

1315 

momentum 1316ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2
 
\
	
cst67 

1316 1317depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

1313 


cst613 1318tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
 
�

1318 


cst614 1319Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
 
�

features.0.features.1.gamma 
'
#moments.features.0.features.1.gamma 

222 

1319 

momentum 1320ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2
 
\
	
cst67 

1320 1321depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�
 
features.0.features.0.weight 


cst615 1322Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
 



�

1313 


cst616 1323tuple_getitem"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/18-ConvBNReLU/features-SequentialCell/1-BatchNorm2d/gradFusedBatchNorm2
 
 
p
p
�

1323 

6 


cst617 1324Conv2DBackpropFilter"�Gradients/Default/network-TrainOneStepCell/network-WithLossCell/_backbone-MobileNetV2/features-SequentialCell/0-ConvBNReLU/features-SequentialCell/0-Conv2d/gradConv2D*
data_format:NCHW**
pad_list� �� �*
pad *
pad_mode:SAME*
out_channel *
output_names �
:output*
mode*
stride��*C
input_names4 �:out_backprop�	:input�:filter_sizes**
dilation����*
kernel_size��*
group2
 



q

1324 

1322 1325
make_tuple"3Default/network-TrainOneStepCell/optimizer-Momentum2


�

1325 1326AddN"3Default/network-TrainOneStepCell/optimizer-Momentum*	
n*
input_names �
:inputs*
output_names �:sum2
 



�

1326 


cst618 1327Mul"3Default/network-TrainOneStepCell/optimizer-Momentum*
output_names �
:output*!
input_names �:x�:y2
 



�
 
features.0.features.0.weight 
(
$moments.features.0.features.0.weight 

222 

1327 

momentum 1328ApplyMomentum"3Default/network-TrainOneStepCell/optimizer-Momentum*
gradient_scale-  �?*
output_names �
:output*e
input_namesV �:variable�:accumulation�:learning_rate�:gradient�:momentum*
use_nesterov *
use_locking 2
 



\
	
cst67 

1328 1329depend"3Default/network-TrainOneStepCell/optimizer-Momentum2
�

1329 

1321 

1317 

1308 

1300 

1296 

1287 

1279 

1275 

1267 

1259 

1255 

1246 

1238 

1234 

1225 

1217 

1213 

1203 

1195 

1191 

1182 

1174 

1170 

1161 

1153 

1149 

1141 

1133 

1129 

1120 

1112 

1108 

1099 

1091 

1087 

1077 

1069 

1065 

1056 

1048 

1044 

1035 

1027 

1023 

1013 

1005 

1001 

992 

984 

980 

971 

963 

959 

951 

943 

939 

930 

922 

918 

909 

901 

897 

887 

879 

875 

866 

858 

854 

845 

837 

833 

823 

815 

811 

802 

794 

790 

781 

773 

769 

759 

751 

747 

738 

730 

726 

717 

709 

705 

697 

689 

685 

676 

668 

664 

655 

647 

643 

633 

625 

621 

612 

604 

600 

591 

583 

579 

569 

561 

557 

548 

540 

536 

527 

519 

515 

507 

499 

495 

486 

478 

474 

465 

457 

453 

443 

435 

431 

422 

414 

410 

401 

393 

389 

379 

371 

367 

358 

350 

346 

337 

329 

325 

317 

309 

305 

296 

288 

284 

275 

267 

263 

255 

247 

243 

231 

224 1330
make_tuple"3Default/network-TrainOneStepCell/optimizer-Momentum2��






























































































































































�

212 


cst619 1331tuple_getitem"\Default/network-TrainOneStepCell/network-WithLossCell/_loss_fn-SoftmaxCrossEntropyWithLogits2
 
R

1331 

1330 1332depend" Default/network-TrainOneStepCell2
 $7217_7215_7213_5169_2585_1_construct8
features.0.features.0.weight
 


+
features.0.features.1.gamma
 *
features.0.features.1.beta
 ?
#features.1.conv.0.features.0.weight

 

2
"features.1.conv.0.features.1.gamma
 1
!features.1.conv.0.features.1.beta
 4
features.1.conv.1.weight

 

'
features.1.conv.2.gamma
&
features.1.conv.2.beta
?
#features.2.conv.0.features.0.weight
`


2
"features.2.conv.0.features.1.gamma
`1
!features.2.conv.0.features.1.beta
`?
#features.2.conv.1.features.0.weight

`

2
"features.2.conv.1.features.1.gamma
`1
!features.2.conv.1.features.1.beta
`4
features.2.conv.2.weight

`

'
features.2.conv.3.gamma
&
features.2.conv.3.beta
@
#features.3.conv.0.features.0.weight
�


3
"features.3.conv.0.features.1.gamma	
�2
!features.3.conv.0.features.1.beta	
�@
#features.3.conv.1.features.0.weight

�

3
"features.3.conv.1.features.1.gamma	
�2
!features.3.conv.1.features.1.beta	
�5
features.3.conv.2.weight

�

'
features.3.conv.3.gamma
&
features.3.conv.3.beta
@
#features.4.conv.0.features.0.weight
�


3
"features.4.conv.0.features.1.gamma	
�2
!features.4.conv.0.features.1.beta	
�@
#features.4.conv.1.features.0.weight

�

3
"features.4.conv.1.features.1.gamma	
�2
!features.4.conv.1.features.1.beta	
�5
features.4.conv.2.weight
 
�

'
features.4.conv.3.gamma
 &
features.4.conv.3.beta
 @
#features.5.conv.0.features.0.weight
�
 

3
"features.5.conv.0.features.1.gamma	
�2
!features.5.conv.0.features.1.beta	
�@
#features.5.conv.1.features.0.weight

�

3
"features.5.conv.1.features.1.gamma	
�2
!features.5.conv.1.features.1.beta	
�5
features.5.conv.2.weight
 
�

'
features.5.conv.3.gamma
 &
features.5.conv.3.beta
 @
#features.6.conv.0.features.0.weight
�
 

3
"features.6.conv.0.features.1.gamma	
�2
!features.6.conv.0.features.1.beta	
�@
#features.6.conv.1.features.0.weight

�

3
"features.6.conv.1.features.1.gamma	
�2
!features.6.conv.1.features.1.beta	
�5
features.6.conv.2.weight
 
�

'
features.6.conv.3.gamma
 &
features.6.conv.3.beta
 @
#features.7.conv.0.features.0.weight
�
 

3
"features.7.conv.0.features.1.gamma	
�2
!features.7.conv.0.features.1.beta	
�@
#features.7.conv.1.features.0.weight

�

3
"features.7.conv.1.features.1.gamma	
�2
!features.7.conv.1.features.1.beta	
�5
features.7.conv.2.weight
@
�

'
features.7.conv.3.gamma
@&
features.7.conv.3.beta
@@
#features.8.conv.0.features.0.weight
�
@

3
"features.8.conv.0.features.1.gamma	
�2
!features.8.conv.0.features.1.beta	
�@
#features.8.conv.1.features.0.weight

�

3
"features.8.conv.1.features.1.gamma	
�2
!features.8.conv.1.features.1.beta	
�5
features.8.conv.2.weight
@
�

'
features.8.conv.3.gamma
@&
features.8.conv.3.beta
@@
#features.9.conv.0.features.0.weight
�
@

3
"features.9.conv.0.features.1.gamma	
�2
!features.9.conv.0.features.1.beta	
�@
#features.9.conv.1.features.0.weight

�

3
"features.9.conv.1.features.1.gamma	
�2
!features.9.conv.1.features.1.beta	
�5
features.9.conv.2.weight
@
�

'
features.9.conv.3.gamma
@&
features.9.conv.3.beta
@A
$features.10.conv.0.features.0.weight
�
@

4
#features.10.conv.0.features.1.gamma	
�3
"features.10.conv.0.features.1.beta	
�A
$features.10.conv.1.features.0.weight

�

4
#features.10.conv.1.features.1.gamma	
�3
"features.10.conv.1.features.1.beta	
�6
features.10.conv.2.weight
@
�

(
features.10.conv.3.gamma
@'
features.10.conv.3.beta
@A
$features.11.conv.0.features.0.weight
�
@

4
#features.11.conv.0.features.1.gamma	
�3
"features.11.conv.0.features.1.beta	
�A
$features.11.conv.1.features.0.weight

�

4
#features.11.conv.1.features.1.gamma	
�3
"features.11.conv.1.features.1.beta	
�6
features.11.conv.2.weight
`
�

(
features.11.conv.3.gamma
`'
features.11.conv.3.beta
`A
$features.12.conv.0.features.0.weight
�
`

4
#features.12.conv.0.features.1.gamma	
�3
"features.12.conv.0.features.1.beta	
�A
$features.12.conv.1.features.0.weight

�

4
#features.12.conv.1.features.1.gamma	
�3
"features.12.conv.1.features.1.beta	
�6
features.12.conv.2.weight
`
�

(
features.12.conv.3.gamma
`'
features.12.conv.3.beta
`A
$features.13.conv.0.features.0.weight
�
`

4
#features.13.conv.0.features.1.gamma	
�3
"features.13.conv.0.features.1.beta	
�A
$features.13.conv.1.features.0.weight

�

4
#features.13.conv.1.features.1.gamma	
�3
"features.13.conv.1.features.1.beta	
�6
features.13.conv.2.weight
`
�

(
features.13.conv.3.gamma
`'
features.13.conv.3.beta
`A
$features.14.conv.0.features.0.weight
�
`

4
#features.14.conv.0.features.1.gamma	
�3
"features.14.conv.0.features.1.beta	
�A
$features.14.conv.1.features.0.weight

�

4
#features.14.conv.1.features.1.gamma	
�3
"features.14.conv.1.features.1.beta	
�7
features.14.conv.2.weight
�
�

)
features.14.conv.3.gamma	
�(
features.14.conv.3.beta	
�B
$features.15.conv.0.features.0.weight
�
�

4
#features.15.conv.0.features.1.gamma	
�3
"features.15.conv.0.features.1.beta	
�A
$features.15.conv.1.features.0.weight

�

4
#features.15.conv.1.features.1.gamma	
�3
"features.15.conv.1.features.1.beta	
�7
features.15.conv.2.weight
�
�

)
features.15.conv.3.gamma	
�(
features.15.conv.3.beta	
�B
$features.16.conv.0.features.0.weight
�
�

4
#features.16.conv.0.features.1.gamma	
�3
"features.16.conv.0.features.1.beta	
�A
$features.16.conv.1.features.0.weight

�

4
#features.16.conv.1.features.1.gamma	
�3
"features.16.conv.1.features.1.beta	
�7
features.16.conv.2.weight
�
�

)
features.16.conv.3.gamma	
�(
features.16.conv.3.beta	
�B
$features.17.conv.0.features.0.weight
�
�

4
#features.17.conv.0.features.1.gamma	
�3
"features.17.conv.0.features.1.beta	
�A
$features.17.conv.1.features.0.weight

�

4
#features.17.conv.1.features.1.gamma	
�3
"features.17.conv.1.features.1.beta	
�7
features.17.conv.2.weight
�
�

)
features.17.conv.3.gamma	
�(
features.17.conv.3.beta	
�;
features.18.features.0.weight
�

�

-
features.18.features.1.gamma	
�
,
features.18.features.1.beta	
�
#
head.1.weight

�
�

head.1.bias	
�@
$moments.features.0.features.0.weight
 


3
#moments.features.0.features.1.gamma
 2
"moments.features.0.features.1.beta
 G
+moments.features.1.conv.0.features.0.weight

 

:
*moments.features.1.conv.0.features.1.gamma
 9
)moments.features.1.conv.0.features.1.beta
 <
 moments.features.1.conv.1.weight

 

/
moments.features.1.conv.2.gamma
.
moments.features.1.conv.2.beta
G
+moments.features.2.conv.0.features.0.weight
`


:
*moments.features.2.conv.0.features.1.gamma
`9
)moments.features.2.conv.0.features.1.beta
`G
+moments.features.2.conv.1.features.0.weight

`

:
*moments.features.2.conv.1.features.1.gamma
`9
)moments.features.2.conv.1.features.1.beta
`<
 moments.features.2.conv.2.weight

`

/
moments.features.2.conv.3.gamma
.
moments.features.2.conv.3.beta
H
+moments.features.3.conv.0.features.0.weight
�


;
*moments.features.3.conv.0.features.1.gamma	
�:
)moments.features.3.conv.0.features.1.beta	
�H
+moments.features.3.conv.1.features.0.weight

�

;
*moments.features.3.conv.1.features.1.gamma	
�:
)moments.features.3.conv.1.features.1.beta	
�=
 moments.features.3.conv.2.weight

�

/
moments.features.3.conv.3.gamma
.
moments.features.3.conv.3.beta
H
+moments.features.4.conv.0.features.0.weight
�


;
*moments.features.4.conv.0.features.1.gamma	
�:
)moments.features.4.conv.0.features.1.beta	
�H
+moments.features.4.conv.1.features.0.weight

�

;
*moments.features.4.conv.1.features.1.gamma	
�:
)moments.features.4.conv.1.features.1.beta	
�=
 moments.features.4.conv.2.weight
 
�

/
moments.features.4.conv.3.gamma
 .
moments.features.4.conv.3.beta
 H
+moments.features.5.conv.0.features.0.weight
�
 

;
*moments.features.5.conv.0.features.1.gamma	
�:
)moments.features.5.conv.0.features.1.beta	
�H
+moments.features.5.conv.1.features.0.weight

�

;
*moments.features.5.conv.1.features.1.gamma	
�:
)moments.features.5.conv.1.features.1.beta	
�=
 moments.features.5.conv.2.weight
 
�

/
moments.features.5.conv.3.gamma
 .
moments.features.5.conv.3.beta
 H
+moments.features.6.conv.0.features.0.weight
�
 

;
*moments.features.6.conv.0.features.1.gamma	
�:
)moments.features.6.conv.0.features.1.beta	
�H
+moments.features.6.conv.1.features.0.weight

�

;
*moments.features.6.conv.1.features.1.gamma	
�:
)moments.features.6.conv.1.features.1.beta	
�=
 moments.features.6.conv.2.weight
 
�

/
moments.features.6.conv.3.gamma
 .
moments.features.6.conv.3.beta
 H
+moments.features.7.conv.0.features.0.weight
�
 

;
*moments.features.7.conv.0.features.1.gamma	
�:
)moments.features.7.conv.0.features.1.beta	
�H
+moments.features.7.conv.1.features.0.weight

�

;
*moments.features.7.conv.1.features.1.gamma	
�:
)moments.features.7.conv.1.features.1.beta	
�=
 moments.features.7.conv.2.weight
@
�

/
moments.features.7.conv.3.gamma
@.
moments.features.7.conv.3.beta
@H
+moments.features.8.conv.0.features.0.weight
�
@

;
*moments.features.8.conv.0.features.1.gamma	
�:
)moments.features.8.conv.0.features.1.beta	
�H
+moments.features.8.conv.1.features.0.weight

�

;
*moments.features.8.conv.1.features.1.gamma	
�:
)moments.features.8.conv.1.features.1.beta	
�=
 moments.features.8.conv.2.weight
@
�

/
moments.features.8.conv.3.gamma
@.
moments.features.8.conv.3.beta
@H
+moments.features.9.conv.0.features.0.weight
�
@

;
*moments.features.9.conv.0.features.1.gamma	
�:
)moments.features.9.conv.0.features.1.beta	
�H
+moments.features.9.conv.1.features.0.weight

�

;
*moments.features.9.conv.1.features.1.gamma	
�:
)moments.features.9.conv.1.features.1.beta	
�=
 moments.features.9.conv.2.weight
@
�

/
moments.features.9.conv.3.gamma
@.
moments.features.9.conv.3.beta
@I
,moments.features.10.conv.0.features.0.weight
�
@

<
+moments.features.10.conv.0.features.1.gamma	
�;
*moments.features.10.conv.0.features.1.beta	
�I
,moments.features.10.conv.1.features.0.weight

�

<
+moments.features.10.conv.1.features.1.gamma	
�;
*moments.features.10.conv.1.features.1.beta	
�>
!moments.features.10.conv.2.weight
@
�

0
 moments.features.10.conv.3.gamma
@/
moments.features.10.conv.3.beta
@I
,moments.features.11.conv.0.features.0.weight
�
@

<
+moments.features.11.conv.0.features.1.gamma	
�;
*moments.features.11.conv.0.features.1.beta	
�I
,moments.features.11.conv.1.features.0.weight

�

<
+moments.features.11.conv.1.features.1.gamma	
�;
*moments.features.11.conv.1.features.1.beta	
�>
!moments.features.11.conv.2.weight
`
�

0
 moments.features.11.conv.3.gamma
`/
moments.features.11.conv.3.beta
`I
,moments.features.12.conv.0.features.0.weight
�
`

<
+moments.features.12.conv.0.features.1.gamma	
�;
*moments.features.12.conv.0.features.1.beta	
�I
,moments.features.12.conv.1.features.0.weight

�

<
+moments.features.12.conv.1.features.1.gamma	
�;
*moments.features.12.conv.1.features.1.beta	
�>
!moments.features.12.conv.2.weight
`
�

0
 moments.features.12.conv.3.gamma
`/
moments.features.12.conv.3.beta
`I
,moments.features.13.conv.0.features.0.weight
�
`

<
+moments.features.13.conv.0.features.1.gamma	
�;
*moments.features.13.conv.0.features.1.beta	
�I
,moments.features.13.conv.1.features.0.weight

�

<
+moments.features.13.conv.1.features.1.gamma	
�;
*moments.features.13.conv.1.features.1.beta	
�>
!moments.features.13.conv.2.weight
`
�

0
 moments.features.13.conv.3.gamma
`/
moments.features.13.conv.3.beta
`I
,moments.features.14.conv.0.features.0.weight
�
`

<
+moments.features.14.conv.0.features.1.gamma	
�;
*moments.features.14.conv.0.features.1.beta	
�I
,moments.features.14.conv.1.features.0.weight

�

<
+moments.features.14.conv.1.features.1.gamma	
�;
*moments.features.14.conv.1.features.1.beta	
�?
!moments.features.14.conv.2.weight
�
�

1
 moments.features.14.conv.3.gamma	
�0
moments.features.14.conv.3.beta	
�J
,moments.features.15.conv.0.features.0.weight
�
�

<
+moments.features.15.conv.0.features.1.gamma	
�;
*moments.features.15.conv.0.features.1.beta	
�I
,moments.features.15.conv.1.features.0.weight

�

<
+moments.features.15.conv.1.features.1.gamma	
�;
*moments.features.15.conv.1.features.1.beta	
�?
!moments.features.15.conv.2.weight
�
�

1
 moments.features.15.conv.3.gamma	
�0
moments.features.15.conv.3.beta	
�J
,moments.features.16.conv.0.features.0.weight
�
�

<
+moments.features.16.conv.0.features.1.gamma	
�;
*moments.features.16.conv.0.features.1.beta	
�I
,moments.features.16.conv.1.features.0.weight

�

<
+moments.features.16.conv.1.features.1.gamma	
�;
*moments.features.16.conv.1.features.1.beta	
�?
!moments.features.16.conv.2.weight
�
�

1
 moments.features.16.conv.3.gamma	
�0
moments.features.16.conv.3.beta	
�J
,moments.features.17.conv.0.features.0.weight
�
�

<
+moments.features.17.conv.0.features.1.gamma	
�;
*moments.features.17.conv.0.features.1.beta	
�I
,moments.features.17.conv.1.features.0.weight

�

<
+moments.features.17.conv.1.features.1.gamma	
�;
*moments.features.17.conv.1.features.1.beta	
�?
!moments.features.17.conv.2.weight
�
�

1
 moments.features.17.conv.3.gamma	
�0
moments.features.17.conv.3.beta	
�C
%moments.features.18.features.0.weight
�

�

5
$moments.features.18.features.1.gamma	
�
4
#moments.features.18.features.1.beta	
�
+
moments.head.1.weight

�
�
$
moments.head.1.bias	
�
momentum
learning_rate

�
global_step
1
!features.0.features.1.moving_mean
 5
%features.0.features.1.moving_variance
 3
"features.18.features.1.moving_mean	
�
7
&features.18.features.1.moving_variance	
�
-
features.1.conv.2.moving_mean
1
!features.1.conv.2.moving_variance
-
features.2.conv.3.moving_mean
1
!features.2.conv.3.moving_variance
-
features.3.conv.3.moving_mean
1
!features.3.conv.3.moving_variance
-
features.4.conv.3.moving_mean
 1
!features.4.conv.3.moving_variance
 -
features.5.conv.3.moving_mean
 1
!features.5.conv.3.moving_variance
 -
features.6.conv.3.moving_mean
 1
!features.6.conv.3.moving_variance
 -
features.7.conv.3.moving_mean
@1
!features.7.conv.3.moving_variance
@-
features.8.conv.3.moving_mean
@1
!features.8.conv.3.moving_variance
@-
features.9.conv.3.moving_mean
@1
!features.9.conv.3.moving_variance
@.
features.10.conv.3.moving_mean
@2
"features.10.conv.3.moving_variance
@.
features.11.conv.3.moving_mean
`2
"features.11.conv.3.moving_variance
`.
features.12.conv.3.moving_mean
`2
"features.12.conv.3.moving_variance
`.
features.13.conv.3.moving_mean
`2
"features.13.conv.3.moving_variance
`/
features.14.conv.3.moving_mean	
�3
"features.14.conv.3.moving_variance	
�/
features.15.conv.3.moving_mean	
�3
"features.15.conv.3.moving_variance	
�/
features.16.conv.3.moving_mean	
�3
"features.16.conv.3.moving_variance	
�/
features.17.conv.3.moving_mean	
�3
"features.17.conv.3.moving_variance	
�8
(features.1.conv.0.features.1.moving_mean
 <
,features.1.conv.0.features.1.moving_variance
 8
(features.2.conv.0.features.1.moving_mean
`<
,features.2.conv.0.features.1.moving_variance
`8
(features.2.conv.1.features.1.moving_mean
`<
,features.2.conv.1.features.1.moving_variance
`9
(features.3.conv.0.features.1.moving_mean	
�=
,features.3.conv.0.features.1.moving_variance	
�9
(features.3.conv.1.features.1.moving_mean	
�=
,features.3.conv.1.features.1.moving_variance	
�9
(features.4.conv.0.features.1.moving_mean	
�=
,features.4.conv.0.features.1.moving_variance	
�9
(features.4.conv.1.features.1.moving_mean	
�=
,features.4.conv.1.features.1.moving_variance	
�9
(features.5.conv.0.features.1.moving_mean	
�=
,features.5.conv.0.features.1.moving_variance	
�9
(features.5.conv.1.features.1.moving_mean	
�=
,features.5.conv.1.features.1.moving_variance	
�9
(features.6.conv.0.features.1.moving_mean	
�=
,features.6.conv.0.features.1.moving_variance	
�9
(features.6.conv.1.features.1.moving_mean	
�=
,features.6.conv.1.features.1.moving_variance	
�9
(features.7.conv.0.features.1.moving_mean	
�=
,features.7.conv.0.features.1.moving_variance	
�9
(features.7.conv.1.features.1.moving_mean	
�=
,features.7.conv.1.features.1.moving_variance	
�9
(features.8.conv.0.features.1.moving_mean	
�=
,features.8.conv.0.features.1.moving_variance	
�9
(features.8.conv.1.features.1.moving_mean	
�=
,features.8.conv.1.features.1.moving_variance	
�9
(features.9.conv.0.features.1.moving_mean	
�=
,features.9.conv.0.features.1.moving_variance	
�9
(features.9.conv.1.features.1.moving_mean	
�=
,features.9.conv.1.features.1.moving_variance	
�:
)features.10.conv.0.features.1.moving_mean	
�>
-features.10.conv.0.features.1.moving_variance	
�:
)features.10.conv.1.features.1.moving_mean	
�>
-features.10.conv.1.features.1.moving_variance	
�:
)features.11.conv.0.features.1.moving_mean	
�>
-features.11.conv.0.features.1.moving_variance	
�:
)features.11.conv.1.features.1.moving_mean	
�>
-features.11.conv.1.features.1.moving_variance	
�:
)features.12.conv.0.features.1.moving_mean	
�>
-features.12.conv.0.features.1.moving_variance	
�:
)features.12.conv.1.features.1.moving_mean	
�>
-features.12.conv.1.features.1.moving_variance	
�:
)features.13.conv.0.features.1.moving_mean	
�>
-features.13.conv.0.features.1.moving_variance	
�:
)features.13.conv.1.features.1.moving_mean	
�>
-features.13.conv.1.features.1.moving_variance	
�:
)features.14.conv.0.features.1.moving_mean	
�>
-features.14.conv.0.features.1.moving_variance	
�:
)features.14.conv.1.features.1.moving_mean	
�>
-features.14.conv.1.features.1.moving_variance	
�:
)features.15.conv.0.features.1.moving_mean	
�>
-features.15.conv.0.features.1.moving_variance	
�:
)features.15.conv.1.features.1.moving_mean	
�>
-features.15.conv.1.features.1.moving_variance	
�:
)features.16.conv.0.features.1.moving_mean	
�>
-features.16.conv.0.features.1.moving_variance	
�:
)features.16.conv.1.features.1.moving_mean	
�>
-features.16.conv.1.features.1.moving_variance	
�:
)features.17.conv.0.features.1.moving_mean	
�>
-features.17.conv.0.features.1.moving_variance	
�:
)features.17.conv.1.features.1.moving_mean	
�>
-features.17.conv.1.features.1.moving_variance	
�"
1332
 *
cst1B*
cst2B *
cst3���������*
cst4*
cst5�*
cst6B*
cst7B*
cst8 *
cst9 *
cst10 *
cst11 *
cst12 *
cst13 *
cst14 *
cst15 *
cst16 *
cst17 *
cst18 *
cst19 *
cst20 *
cst21 *
cst22 *
cst23 *
cst24 *
cst25 *
cst26 *
cst27 *
cst28 *
cst29 *
cst30 *
cst31 *
cst32 *
cst33 *
cst34 *
cst35 *
cst36 *
cst37 *
cst38 *
cst39 *
cst40 *
cst41 *
cst42 *
cst43 *
cst44 *
cst45 *
cst46 *
cst47 *
cst48 *
cst49 *
cst50 *
cst51 *
cst52 *
cst53 *
cst54 *
cst55 *
cst56 *
cst57 *
cst58 *
cst59 *
cst60 *
cst61��*
cst62� ��
*
cst63*
cst64B*
cst65B*
cst66 *
cst67*
cst68B*
cst69B*
cst70*
cst71*(
cst72� ��
��*'
cst73����*
cst74B*
cst75*
cst76B*
cst77*
cst78B*
cst79B*
cst80 *)
cst81 ��
����*
cst82B*
cst83*
cst84*(
cst85� ����*
cst86*
cst87B*
cst88*
cst89B*
cst90B*
cst91 *)
cst92 ������*
cst93B*
cst94*
cst95*(
cst96� ����*
cst97*
cst98B*
cst99*
cst100B*
cst101B*
cst102 *)
cst103�����*
cst104B*
cst105*
cst106*)
cst107� ����*
cst108*
cst109B*
cst110*
cst111B*
cst112B*
cst113 **
cst114 ������*
cst115B*
cst116*
cst117*)
cst118� ����*
cst119*
cst120B*
cst121*
cst122B*
cst123B*
cst124 **
cst125 ������*
cst126B*
cst127*
cst128*)
cst129� ����*
cst130*
cst131B*
cst132*
cst133B*
cst134B*
cst135 *)
cst136�����*
cst137B*
cst138*
cst139*)
cst140� ����*
cst141*
cst142B*
cst143*
cst144B*
cst145B*
cst146 *
cst147B*
cst148*
cst149*
cst150*
cst151B*
cst152*
cst153B*
cst154B*
cst155 *
cst156B*
cst157*
cst158*)
cst159� ����*
cst160*
cst161B*
cst162*
cst163B*
cst164B*
cst165 *)
cst166�����*
cst167B*
cst168*
cst169*)
cst170� ����*
cst171*
cst172B*
cst173*
cst174B*
cst175B*
cst176 *
cst177B*
cst178*
cst179*
cst180*
cst181B*
cst182*
cst183B*
cst184B*
cst185 **
cst186 ������*
cst187B*
cst188*
cst189*)
cst190� ����*
cst191*
cst192B*
cst193*
cst194B*
cst195B*
cst196 *)
cst197�����*
cst198B*
cst199*
cst200*)
cst201� ����*
cst202*
cst203B*
cst204*
cst205B*
cst206B*
cst207 *)
cst208���`��*
cst209B*
cst210*
cst211*(
cst212� �`��*
cst213*
cst214B*
cst215*
cst216B*
cst217B*
cst218 *)
cst219�`����*
cst220B*
cst221*
cst222*)
cst223� ����*
cst224*
cst225B*
cst226*
cst227B*
cst228B*
cst229 *)
cst230�����*
cst231B*
cst232*
cst233*)
cst234� ����*
cst235*
cst236B*
cst237*
cst238B*
cst239B*
cst240 *
cst241B*
cst242*
cst243*
cst244*
cst245B*
cst246*
cst247B*
cst248B*
cst249 *
cst250B*
cst251*
cst252*)
cst253� ����*
cst254*
cst255B*
cst256*
cst257B*
cst258B*
cst259 *)
cst260�����*
cst261B*
cst262*
cst263*)
cst264� ����*
cst265*
cst266B*
cst267*
cst268B*
cst269B*
cst270 *
cst271B*
cst272*
cst273*
cst274*
cst275B*
cst276*
cst277B*
cst278B*
cst279 *)
cst280�`����*
cst281B*
cst282*
cst283*)
cst284� ����*
cst285*
cst286B*
cst287*
cst288B*
cst289B*
cst290 *)
cst291�����*
cst292B*
cst293*
cst294*)
cst295� ����*
cst296*
cst297B*
cst298*
cst299B*
cst300B*
cst301 *)
cst302���@��*
cst303B*
cst304*
cst305*(
cst306� �@��*
cst307*
cst308B*
cst309*
cst310B*
cst311B*
cst312 *)
cst313�@����*
cst314B*
cst315*
cst316*)
cst317� ����*
cst318*
cst319B*
cst320*
cst321B*
cst322B*
cst323 *)
cst324�����*
cst325B*
cst326*
cst327*)
cst328� ����*
cst329*
cst330B*
cst331*
cst332B*
cst333B*
cst334 *
cst335B*
cst336*
cst337*
cst338*
cst339B*
cst340*
cst341B*
cst342B*
cst343 *
cst344B*
cst345*
cst346*)
cst347� ����*
cst348*
cst349B*
cst350*
cst351B*
cst352B*
cst353 *)
cst354�����*
cst355B*
cst356*
cst357*)
cst358� ����*
cst359*
cst360B*
cst361*
cst362B*
cst363B*
cst364 *
cst365B*
cst366*
cst367*
cst368*
cst369B*
cst370*
cst371B*
cst372B*
cst373 *
cst374B*
cst375*
cst376*)
cst377� ����*
cst378*
cst379B*
cst380*
cst381B*
cst382B*
cst383 *)
cst384�����*
cst385B*
cst386*
cst387*)
cst388� ����*
cst389*
cst390B*
cst391*
cst392B*
cst393B*
cst394 *
cst395B*
cst396*
cst397*
cst398*
cst399B*
cst400*
cst401B*
cst402B*
cst403 *)
cst404�@����*
cst405B*
cst406*
cst407*)
cst408� ����*
cst409*
cst410B*
cst411*
cst412B*
cst413B*
cst414 *)
cst415�����*
cst416B*
cst417*
cst418*)
cst419� ����*
cst420*
cst421B*
cst422*
cst423B*
cst424B*
cst425 *)
cst426��� ��*
cst427B*
cst428*
cst429*(
cst430� � ��*
cst431*
cst432B*
cst433*
cst434B*
cst435B*
cst436 *)
cst437� ����*
cst438B*
cst439*
cst440*)
cst441� ����*
cst442*
cst443B*
cst444*
cst445B*
cst446B*
cst447 *)
cst448�����*
cst449B*
cst450*
cst451*)
cst452� ����*
cst453*
cst454B*
cst455*
cst456B*
cst457B*
cst458 *
cst459B*
cst460*
cst461*
cst462*
cst463B*
cst464*
cst465B*
cst466B*
cst467 *
cst468B*
cst469*
cst470*)
cst471� ����*
cst472*
cst473B*
cst474*
cst475B*
cst476B*
cst477 *)
cst478�����*
cst479B*
cst480*
cst481*)
cst482� ����*
cst483*
cst484B*
cst485*
cst486B*
cst487B*
cst488 *
cst489B*
cst490*
cst491*
cst492*
cst493B*
cst494*
cst495B*
cst496B*
cst497 *)
cst498� ����*
cst499B*
cst500*
cst501*)
cst502� ����*
cst503*
cst504B*
cst505*
cst506B*
cst507B*
cst508 *)
cst509�����*
cst510B*
cst511*
cst512*)
cst513� ���8�8*
cst514*
cst515B*
cst516*
cst517B*
cst518B*
cst519 *)
cst520�����*
cst521B*
cst522*
cst523*(
cst524� ��8�8*
cst525*
cst526B*
cst527*
cst528B*
cst529B*
cst530 *)
cst531�����*
cst532B*
cst533*
cst534*)
cst535� ���8�8*
cst536*
cst537B*
cst538*
cst539B*
cst540B*
cst541 *)
cst542�����*
cst543B*
cst544*
cst545*)
cst546� ���8�8*
cst547*
cst548B*
cst549*
cst550B*
cst551B*
cst552 *
cst553B*
cst554*
cst555*
cst556*
cst557B*
cst558*
cst559B*
cst560B*
cst561 *(
cst562��`��*
cst563B*
cst564*
cst565*(
cst566� �`�8�8*
cst567*
cst568B*
cst569*
cst570B*
cst571B*
cst572 *(
cst573��`��*
cst574B*
cst575*
cst576*(
cst577� �`�p�p*
cst578*
cst579B*
cst580*
cst581B*
cst582B*
cst583 *(
cst584�`���*
cst585B*
cst586*
cst587*(
cst588� ��p�p*
cst589*
cst590B*
cst591*
cst592B*
cst593B*
cst594 *(
cst595�� ��*
cst596B*
cst597*
cst598*(
cst599� � �p�p*
cst600*
cst601B*
cst602*
cst603B*
cst604B*
cst605 *(
cst606�� ��*
cst607B*
cst608*
cst609*(
cst610� � �p�p*
cst611*
cst612B*
cst613*
cst614B*
cst615B*
cst616 *(
cst617� ���*
cst618B*
cst619 