using System.ComponentModel;
using MembershipInfrustructure.Model.Authentication;
using MembershipInfrustructure.Model.Users;

namespace MembershipInfrustructure.Model.Donation;

public class DonationEventDetail : WithIdModel2
{
    
    public Guid? DonationEventId { get; set; }
    
    public virtual DonationEvent DonationEvent { get; set; }
    
    public string? PhoneNumber { get; set; }
    
    public string Text_Rn { get; set; }
    
    public double Amount { get; set; }

    [DefaultValue(false)]
    public bool IsPaid { get; set; }
    
}