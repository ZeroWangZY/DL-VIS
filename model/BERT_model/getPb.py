import os
import modeling
import optimization
import tensorflow as tf
with tf.Session(config=tf.ConfigProto(allow_soft_placement=True)) as sess:
    input_ids = tf.constant([[31, 51, 99], [15, 5, 0]])
    input_mask = tf.constant([[1, 1, 1], [1, 1, 0]])
    token_type_ids = tf.constant([[0, 0, 1], [0, 2, 0]])

    config = modeling.BertConfig(vocab_size=32000, hidden_size=516,
    num_hidden_layers=8, num_attention_heads=6, intermediate_size=1024)

    model = modeling.BertModel(config=config, is_training=True,
    input_ids=input_ids, input_mask=input_mask, token_type_ids=token_type_ids)

    # label_embeddings = tf.get_variable(...)
    pooled_output = model.get_pooled_output()
    # logits = tf.matmul(pooled_output, label_embeddings)
    with open("bert.pbtxt", "w") as f:
        f.write(str(sess.graph.as_graph_def()))
    tf.summary.FileWriter('log/bert', sess.graph)