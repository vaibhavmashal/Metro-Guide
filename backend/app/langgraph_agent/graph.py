"""
LangGraph StateGraph Assembly for Metro Route Chatbot.

Builds and compiles the metro_graph which orchestrates all nodes:
  think → extract_intent → [route | general_chat] → format_response
"""

from langgraph.graph import END, START, StateGraph

from app.langgraph_agent.state import MetroChatState
from app.langgraph_agent.nodes import (
    extract_intent_node,
    format_response_node,
    general_chat_node,
    geocode_node,
    nearest_station_node,
    route_planning_node,
    think_node,
)


def _route_or_chat(state: MetroChatState) -> str:
    """Conditional edge: route to geocoding pipeline or general chat."""
    if state.get("intent_is_route") and state.get("source_place"):
        return "route"
    return "chat"


# ── Build the graph ───────────────────────────────────────────────────
workflow = StateGraph(MetroChatState)

# Add nodes
workflow.add_node("think", think_node)
workflow.add_node("extract_intent", extract_intent_node)
workflow.add_node("general_chat", general_chat_node)
workflow.add_node("geocode", geocode_node)
workflow.add_node("nearest_station", nearest_station_node)
workflow.add_node("route_planning", route_planning_node)
workflow.add_node("format_response", format_response_node)

# Define edges
workflow.add_edge(START, "think")
workflow.add_edge("think", "extract_intent")

# Conditional branch after intent extraction
workflow.add_conditional_edges(
    "extract_intent",
    _route_or_chat,
    {
        "route": "geocode",
        "chat": "general_chat",
    },
)

# Route pipeline
workflow.add_edge("geocode", "nearest_station")
workflow.add_edge("nearest_station", "route_planning")
workflow.add_edge("route_planning", "format_response")

# Terminal edges
workflow.add_edge("format_response", END)
workflow.add_edge("general_chat", END)

# Compile
metro_graph = workflow.compile()
