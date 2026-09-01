namespace DiceDeductionDuel;

public sealed class Fighter
{
    public Fighter(string name, int attack, int defense, int maxHealth)
    {
        Name = name;
        Attack = attack;
        Defense = defense;
        MaxHealth = maxHealth;
        CurrentHealth = maxHealth;
    }

    public string Name { get; }
    public int Attack { get; }
    public int Defense { get; }
    public int MaxHealth { get; }
    public int CurrentHealth { get; private set; }
    public bool IsDefeated => CurrentHealth <= 0;

    public void TakeDamage(int damage)
    {
        CurrentHealth = Math.Max(0, CurrentHealth - damage);
    }
}
