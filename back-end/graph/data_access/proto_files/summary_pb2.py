# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: summary.proto

import sys

_b = sys.version_info[0] < 3 and (lambda x: x) or (lambda x: x.encode("latin1"))
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from google.protobuf import reflection as _reflection
from google.protobuf import symbol_database as _symbol_database

# @@protoc_insertion_point(imports)

_sym_db = _symbol_database.Default()

from ..proto_files import anf_ir_pb2 as anf__ir__pb2

DESCRIPTOR = _descriptor.FileDescriptor(
    name="summary.proto",
    package="",
    syntax="proto2",
    serialized_options=_b("\370\001\001"),
    serialized_pb=_b(
        '\n\rsummary.proto\x1a\x0c\x61nf_ir.proto"\x82\x01\n\x05\x45vent\x12\x11\n\twall_time\x18\x01 \x02(\x01\x12\x0c\n\x04step\x18\x02 \x01(\x03\x12\x11\n\x07version\x18\x03 \x01(\tH\x00\x12 \n\tgraph_def\x18\x04 \x01(\x0b\x32\x0b.GraphProtoH\x00\x12\x1b\n\x07summary\x18\x05 \x01(\x0b\x32\x08.SummaryH\x00\x42\x06\n\x04what"\xf3\x01\n\x07Summary\x12\x1d\n\x05value\x18\x01 \x03(\x0b\x32\x0e.Summary.Value\x1aQ\n\x05Image\x12\x0e\n\x06height\x18\x01 \x02(\x05\x12\r\n\x05width\x18\x02 \x02(\x05\x12\x12\n\ncolorspace\x18\x03 \x02(\x05\x12\x15\n\rencoded_image\x18\x04 \x02(\x0c\x1av\n\x05Value\x12\x0b\n\x03tag\x18\x01 \x02(\t\x12\x16\n\x0cscalar_value\x18\x03 \x01(\x02H\x00\x12\x1f\n\x05image\x18\x04 \x01(\x0b\x32\x0e.Summary.ImageH\x00\x12\x1e\n\x06tensor\x18\x08 \x01(\x0b\x32\x0c.TensorProtoH\x00\x42\x07\n\x05valueB\x03\xf8\x01\x01'
    ),
    dependencies=[anf__ir__pb2.DESCRIPTOR,],
)


_EVENT = _descriptor.Descriptor(
    name="Event",
    full_name="Event",
    filename=None,
    file=DESCRIPTOR,
    containing_type=None,
    fields=[
        _descriptor.FieldDescriptor(
            name="wall_time",
            full_name="Event.wall_time",
            index=0,
            number=1,
            type=1,
            cpp_type=5,
            label=2,
            has_default_value=False,
            default_value=float(0),
            message_type=None,
            enum_type=None,
            containing_type=None,
            is_extension=False,
            extension_scope=None,
            serialized_options=None,
            file=DESCRIPTOR,
        ),
        _descriptor.FieldDescriptor(
            name="step",
            full_name="Event.step",
            index=1,
            number=2,
            type=3,
            cpp_type=2,
            label=1,
            has_default_value=False,
            default_value=0,
            message_type=None,
            enum_type=None,
            containing_type=None,
            is_extension=False,
            extension_scope=None,
            serialized_options=None,
            file=DESCRIPTOR,
        ),
        _descriptor.FieldDescriptor(
            name="version",
            full_name="Event.version",
            index=2,
            number=3,
            type=9,
            cpp_type=9,
            label=1,
            has_default_value=False,
            default_value=_b("").decode("utf-8"),
            message_type=None,
            enum_type=None,
            containing_type=None,
            is_extension=False,
            extension_scope=None,
            serialized_options=None,
            file=DESCRIPTOR,
        ),
        _descriptor.FieldDescriptor(
            name="graph_def",
            full_name="Event.graph_def",
            index=3,
            number=4,
            type=11,
            cpp_type=10,
            label=1,
            has_default_value=False,
            default_value=None,
            message_type=None,
            enum_type=None,
            containing_type=None,
            is_extension=False,
            extension_scope=None,
            serialized_options=None,
            file=DESCRIPTOR,
        ),
        _descriptor.FieldDescriptor(
            name="summary",
            full_name="Event.summary",
            index=4,
            number=5,
            type=11,
            cpp_type=10,
            label=1,
            has_default_value=False,
            default_value=None,
            message_type=None,
            enum_type=None,
            containing_type=None,
            is_extension=False,
            extension_scope=None,
            serialized_options=None,
            file=DESCRIPTOR,
        ),
    ],
    extensions=[],
    nested_types=[],
    enum_types=[],
    serialized_options=None,
    is_extendable=False,
    syntax="proto2",
    extension_ranges=[],
    oneofs=[
        _descriptor.OneofDescriptor(
            name="what",
            full_name="Event.what",
            index=0,
            containing_type=None,
            fields=[],
        ),
    ],
    serialized_start=32,
    serialized_end=162,
)


_SUMMARY_IMAGE = _descriptor.Descriptor(
    name="Image",
    full_name="Summary.Image",
    filename=None,
    file=DESCRIPTOR,
    containing_type=None,
    fields=[
        _descriptor.FieldDescriptor(
            name="height",
            full_name="Summary.Image.height",
            index=0,
            number=1,
            type=5,
            cpp_type=1,
            label=2,
            has_default_value=False,
            default_value=0,
            message_type=None,
            enum_type=None,
            containing_type=None,
            is_extension=False,
            extension_scope=None,
            serialized_options=None,
            file=DESCRIPTOR,
        ),
        _descriptor.FieldDescriptor(
            name="width",
            full_name="Summary.Image.width",
            index=1,
            number=2,
            type=5,
            cpp_type=1,
            label=2,
            has_default_value=False,
            default_value=0,
            message_type=None,
            enum_type=None,
            containing_type=None,
            is_extension=False,
            extension_scope=None,
            serialized_options=None,
            file=DESCRIPTOR,
        ),
        _descriptor.FieldDescriptor(
            name="colorspace",
            full_name="Summary.Image.colorspace",
            index=2,
            number=3,
            type=5,
            cpp_type=1,
            label=2,
            has_default_value=False,
            default_value=0,
            message_type=None,
            enum_type=None,
            containing_type=None,
            is_extension=False,
            extension_scope=None,
            serialized_options=None,
            file=DESCRIPTOR,
        ),
        _descriptor.FieldDescriptor(
            name="encoded_image",
            full_name="Summary.Image.encoded_image",
            index=3,
            number=4,
            type=12,
            cpp_type=9,
            label=2,
            has_default_value=False,
            default_value=_b(""),
            message_type=None,
            enum_type=None,
            containing_type=None,
            is_extension=False,
            extension_scope=None,
            serialized_options=None,
            file=DESCRIPTOR,
        ),
    ],
    extensions=[],
    nested_types=[],
    enum_types=[],
    serialized_options=None,
    is_extendable=False,
    syntax="proto2",
    extension_ranges=[],
    oneofs=[],
    serialized_start=207,
    serialized_end=288,
)

_SUMMARY_VALUE = _descriptor.Descriptor(
    name="Value",
    full_name="Summary.Value",
    filename=None,
    file=DESCRIPTOR,
    containing_type=None,
    fields=[
        _descriptor.FieldDescriptor(
            name="tag",
            full_name="Summary.Value.tag",
            index=0,
            number=1,
            type=9,
            cpp_type=9,
            label=2,
            has_default_value=False,
            default_value=_b("").decode("utf-8"),
            message_type=None,
            enum_type=None,
            containing_type=None,
            is_extension=False,
            extension_scope=None,
            serialized_options=None,
            file=DESCRIPTOR,
        ),
        _descriptor.FieldDescriptor(
            name="scalar_value",
            full_name="Summary.Value.scalar_value",
            index=1,
            number=3,
            type=2,
            cpp_type=6,
            label=1,
            has_default_value=False,
            default_value=float(0),
            message_type=None,
            enum_type=None,
            containing_type=None,
            is_extension=False,
            extension_scope=None,
            serialized_options=None,
            file=DESCRIPTOR,
        ),
        _descriptor.FieldDescriptor(
            name="image",
            full_name="Summary.Value.image",
            index=2,
            number=4,
            type=11,
            cpp_type=10,
            label=1,
            has_default_value=False,
            default_value=None,
            message_type=None,
            enum_type=None,
            containing_type=None,
            is_extension=False,
            extension_scope=None,
            serialized_options=None,
            file=DESCRIPTOR,
        ),
        _descriptor.FieldDescriptor(
            name="tensor",
            full_name="Summary.Value.tensor",
            index=3,
            number=8,
            type=11,
            cpp_type=10,
            label=1,
            has_default_value=False,
            default_value=None,
            message_type=None,
            enum_type=None,
            containing_type=None,
            is_extension=False,
            extension_scope=None,
            serialized_options=None,
            file=DESCRIPTOR,
        ),
    ],
    extensions=[],
    nested_types=[],
    enum_types=[],
    serialized_options=None,
    is_extendable=False,
    syntax="proto2",
    extension_ranges=[],
    oneofs=[
        _descriptor.OneofDescriptor(
            name="value",
            full_name="Summary.Value.value",
            index=0,
            containing_type=None,
            fields=[],
        ),
    ],
    serialized_start=290,
    serialized_end=408,
)

_SUMMARY = _descriptor.Descriptor(
    name="Summary",
    full_name="Summary",
    filename=None,
    file=DESCRIPTOR,
    containing_type=None,
    fields=[
        _descriptor.FieldDescriptor(
            name="value",
            full_name="Summary.value",
            index=0,
            number=1,
            type=11,
            cpp_type=10,
            label=3,
            has_default_value=False,
            default_value=[],
            message_type=None,
            enum_type=None,
            containing_type=None,
            is_extension=False,
            extension_scope=None,
            serialized_options=None,
            file=DESCRIPTOR,
        ),
    ],
    extensions=[],
    nested_types=[_SUMMARY_IMAGE, _SUMMARY_VALUE,],
    enum_types=[],
    serialized_options=None,
    is_extendable=False,
    syntax="proto2",
    extension_ranges=[],
    oneofs=[],
    serialized_start=165,
    serialized_end=408,
)

_EVENT.fields_by_name["graph_def"].message_type = anf__ir__pb2._GRAPHPROTO
_EVENT.fields_by_name["summary"].message_type = _SUMMARY
_EVENT.oneofs_by_name["what"].fields.append(_EVENT.fields_by_name["version"])
_EVENT.fields_by_name["version"].containing_oneof = _EVENT.oneofs_by_name["what"]
_EVENT.oneofs_by_name["what"].fields.append(_EVENT.fields_by_name["graph_def"])
_EVENT.fields_by_name["graph_def"].containing_oneof = _EVENT.oneofs_by_name["what"]
_EVENT.oneofs_by_name["what"].fields.append(_EVENT.fields_by_name["summary"])
_EVENT.fields_by_name["summary"].containing_oneof = _EVENT.oneofs_by_name["what"]
_SUMMARY_IMAGE.containing_type = _SUMMARY
_SUMMARY_VALUE.fields_by_name["image"].message_type = _SUMMARY_IMAGE
_SUMMARY_VALUE.fields_by_name["tensor"].message_type = anf__ir__pb2._TENSORPROTO
_SUMMARY_VALUE.containing_type = _SUMMARY
_SUMMARY_VALUE.oneofs_by_name["value"].fields.append(
    _SUMMARY_VALUE.fields_by_name["scalar_value"]
)
_SUMMARY_VALUE.fields_by_name[
    "scalar_value"
].containing_oneof = _SUMMARY_VALUE.oneofs_by_name["value"]
_SUMMARY_VALUE.oneofs_by_name["value"].fields.append(
    _SUMMARY_VALUE.fields_by_name["image"]
)
_SUMMARY_VALUE.fields_by_name["image"].containing_oneof = _SUMMARY_VALUE.oneofs_by_name[
    "value"
]
_SUMMARY_VALUE.oneofs_by_name["value"].fields.append(
    _SUMMARY_VALUE.fields_by_name["tensor"]
)
_SUMMARY_VALUE.fields_by_name[
    "tensor"
].containing_oneof = _SUMMARY_VALUE.oneofs_by_name["value"]
_SUMMARY.fields_by_name["value"].message_type = _SUMMARY_VALUE
DESCRIPTOR.message_types_by_name["Event"] = _EVENT
DESCRIPTOR.message_types_by_name["Summary"] = _SUMMARY
_sym_db.RegisterFileDescriptor(DESCRIPTOR)

Event = _reflection.GeneratedProtocolMessageType(
    "Event",
    (_message.Message,),
    dict(
        DESCRIPTOR=_EVENT,
        __module__="summary_pb2"
        # @@protoc_insertion_point(class_scope:Event)
    ),
)
_sym_db.RegisterMessage(Event)

Summary = _reflection.GeneratedProtocolMessageType(
    "Summary",
    (_message.Message,),
    dict(
        Image=_reflection.GeneratedProtocolMessageType(
            "Image",
            (_message.Message,),
            dict(
                DESCRIPTOR=_SUMMARY_IMAGE,
                __module__="summary_pb2"
                # @@protoc_insertion_point(class_scope:Summary.Image)
            ),
        ),
        Value=_reflection.GeneratedProtocolMessageType(
            "Value",
            (_message.Message,),
            dict(
                DESCRIPTOR=_SUMMARY_VALUE,
                __module__="summary_pb2"
                # @@protoc_insertion_point(class_scope:Summary.Value)
            ),
        ),
        DESCRIPTOR=_SUMMARY,
        __module__="summary_pb2"
        # @@protoc_insertion_point(class_scope:Summary)
    ),
)
_sym_db.RegisterMessage(Summary)
_sym_db.RegisterMessage(Summary.Image)
_sym_db.RegisterMessage(Summary.Value)


DESCRIPTOR._options = None
# @@protoc_insertion_point(module_scope)
