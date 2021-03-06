"º=
Y

cst1 

data 1ImageSummary".Default/network-WithLossCell/_backbone-AlexNet2
Ô

data 

conv1.weight 2Conv2D";Default/network-WithLossCell/_backbone-AlexNet/conv1-Conv2d**
pad_list    *
pad *
pad_mode	:valid*
mode*
out_channel`*
output_names 
:output*
data_format:NCHW*(
stride*!
input_names :x:w**
dilation*
kernel_size*
group2
 
`
7
7
 

2 3ReLU"8Default/network-WithLossCell/_backbone-AlexNet/relu-ReLU*
output_names 
:output*
input_names
 :x2
 
`
7
7
±

3 4MaxPool"CDefault/network-WithLossCell/_backbone-AlexNet/max_pool2d-MaxPool2d*)
strides*
data_format:NCHW*'
ksize*
padding	:VALID*
input_names
 :x*
output_names 
:output2
 
`


Ò

4 

conv2.weight 5Conv2D";Default/network-WithLossCell/_backbone-AlexNet/conv2-Conv2d**
pad_list*
pad *
pad_mode:same*
mode*
out_channel*
output_names 
:output*
data_format:NCHW*(
stride*!
input_names :x:w**
dilation*
kernel_size*
group2
 



¡

5 6ReLU"8Default/network-WithLossCell/_backbone-AlexNet/relu-ReLU*
output_names 
:output*
input_names
 :x2
 



²

6 7MaxPool"CDefault/network-WithLossCell/_backbone-AlexNet/max_pool2d-MaxPool2d*)
strides*
data_format:NCHW*'
ksize*
padding	:VALID*
input_names
 :x*
output_names 
:output2
 



Ò

7 

conv3.weight 8Conv2D";Default/network-WithLossCell/_backbone-AlexNet/conv3-Conv2d**
pad_list*
pad *
pad_mode:same*
mode*
out_channel*
output_names 
:output*
data_format:NCHW*(
stride*!
input_names :x:w**
dilation*
kernel_size*
group2
 



¡

8 9ReLU"8Default/network-WithLossCell/_backbone-AlexNet/relu-ReLU*
output_names 
:output*
input_names
 :x2
 



Ó

9 

conv4.weight 10Conv2D";Default/network-WithLossCell/_backbone-AlexNet/conv4-Conv2d**
pad_list*
pad *
pad_mode:same*
mode*
out_channel*
output_names 
:output*
data_format:NCHW*(
stride*!
input_names :x:w**
dilation*
kernel_size*
group2
 



£

10 11ReLU"8Default/network-WithLossCell/_backbone-AlexNet/relu-ReLU*
output_names 
:output*
input_names
 :x2
 



Ò

11 

conv5.weight 12Conv2D";Default/network-WithLossCell/_backbone-AlexNet/conv5-Conv2d**
pad_list*
pad *
pad_mode:same*
mode*
out_channel`*
output_names 
:output*
data_format:NCHW*(
stride*!
input_names :x:w**
dilation*
kernel_size*
group2
 
`


¢

12 13ReLU"8Default/network-WithLossCell/_backbone-AlexNet/relu-ReLU*
output_names 
:output*
input_names
 :x2
 
`


³

13 14MaxPool"CDefault/network-WithLossCell/_backbone-AlexNet/max_pool2d-MaxPool2d*)
strides*
data_format:NCHW*'
ksize*
padding	:VALID*
input_names
 :x*
output_names 
:output2
 
`


¯

14 

cst2 15Reshape".Default/network-WithLossCell/_backbone-AlexNet*
output_names 
:output**
input_names 
:tensor	:shape2	
 



15 


fc1.weight 16MatMul"8Default/network-WithLossCell/_backbone-AlexNet/fc3-Dense*
transpose_b*
transpose_a *
transpose_x2*
transpose_x1 *#
input_names :x1:x2*
output_names 
:output2	
 
 
Í

16 

fc1.bias 17BiasAdd"8Default/network-WithLossCell/_backbone-AlexNet/fc3-Dense*
data_format:NCHW*!
input_names :x:b*
output_names 
:output2	
 
 


17 18ReLU"8Default/network-WithLossCell/_backbone-AlexNet/relu-ReLU*
output_names 
:output*
input_names
 :x2	
 
 


18 


fc2.weight 19MatMul"8Default/network-WithLossCell/_backbone-AlexNet/fc3-Dense*
transpose_b*
transpose_a *
transpose_x2*
transpose_x1 *#
input_names :x1:x2*
output_names 
:output2	
 
 
Í

19 

fc2.bias 20BiasAdd"8Default/network-WithLossCell/_backbone-AlexNet/fc3-Dense*
data_format:NCHW*!
input_names :x:b*
output_names 
:output2	
 
 


20 21ReLU"8Default/network-WithLossCell/_backbone-AlexNet/relu-ReLU*
output_names 
:output*
input_names
 :x2	
 
 


21 


fc3.weight 22MatMul"8Default/network-WithLossCell/_backbone-AlexNet/fc3-Dense*
transpose_b*
transpose_a *
transpose_x2*
transpose_x1 *#
input_names :x1:x2*
output_names 
:output2
 


Ì

22 

fc3.bias 23BiasAdd"8Default/network-WithLossCell/_backbone-AlexNet/fc3-Dense*
data_format:NCHW*!
input_names :x:b*
output_names 
:output2
 


]

23 

1 24depend".Default/network-WithLossCell/_backbone-AlexNet2
 



	
label 

cst3 

cst4 

cst5 25OneHot"6Default/network-WithLossCell/_loss_fn-CrossEntropyLoss*
axisÿÿÿÿÿÿÿÿÿ*
output_names 
:output*J
input_names; :indices	:depth:on_value:	off_value2
 




24 

25 26SoftmaxCrossEntropyWithLogits"6Default/network-WithLossCell/_loss_fn-CrossEntropyLoss2


k

26 

cst6 27tuple_getitem"6Default/network-WithLossCell/_loss_fn-CrossEntropyLoss2
 
½

27 

cst7 28
ReduceMean"6Default/network-WithLossCell/_loss_fn-CrossEntropyLoss*
	keep_dims *
output_names
 :y**
input_names :input_x:axis2
a

cst8 

28 29ScalarSummary"6Default/network-WithLossCell/_loss_fn-CrossEntropyLoss2
\

28 

29 30depend"6Default/network-WithLossCell/_loss_fn-CrossEntropyLoss2
R

30 

24 
	
label 31
make_tuple"Default2


455_454_403_352_construct"
data
 

ã
ã
label
 
fc3.bias



fc3.weight	


 
fc2.bias	
  

fc2.weight

 
 
fc1.bias	
  

fc1.weight

 
)
conv5.weight
`


*
conv4.weight



*
conv3.weight



)
conv2.weight

`

(
conv1.weight
`


""
31


*
cst1	:image*!
cst2 ÿÿÿÿÿÿÿÿÿ*
cst3
*
cst4B*
cst5B*
cst6 *
cst7ÿÿÿÿÿÿÿÿÿ*
cst8:loss