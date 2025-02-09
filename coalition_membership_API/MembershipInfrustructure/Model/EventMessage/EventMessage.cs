using MembershipInfrustructure.Model.Authentication;
using MembershipInfrustructure.Model.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace MembershipInfrustructure.Model.Message;

public class EventMessage:WithIdModel2
{
    public string Content { get; set; }
    
  
    public List<MessageType> MessageTypes { get; set; } = new List<MessageType>();

    
    public bool IsApproved { get; set; }
  
}

public enum MessageType
{
    Email, 
    SMS,
    Telegram,
    WhatsApp,
}